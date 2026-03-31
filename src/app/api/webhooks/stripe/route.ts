import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { getPriceTierMap } from '@/lib/stripe/products'
import { resend } from '@/lib/resend/client'
import { createServiceClient } from '@/lib/supabase/server'
import { render } from '@react-email/render'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { PaymentFailedEmail } from '@/components/emails/PaymentFailedEmail'
import type { MembershipTier } from '@/types/membership'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 })
  }

  const supabase = await createServiceClient()
  const priceTierMap = getPriceTierMap()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const tier = (priceTierMap[priceId] ??
          subscription.metadata?.tier) as MembershipTier | undefined

        if (!tier) break

        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'canceled'
          : 'pending'

        // current_period_start/end moved to items in Stripe API 2025+
        const subItem = subscription.items.data[0]
        const periodStart = (subItem as unknown as { current_period_start?: number }).current_period_start
          ?? (subscription as unknown as { current_period_start?: number }).current_period_start
        const periodEnd = (subItem as unknown as { current_period_end?: number }).current_period_end
          ?? (subscription as unknown as { current_period_end?: number }).current_period_end

        await supabase
          .from('memberships')
          .update({
            tier,
            status,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_customer_id', subscription.customer as string)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from('memberships')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', subscription.customer as string)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Ensure membership is active
        const { data: membership } = await supabase
          .from('memberships')
          .select('id, tier, user_id, status')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!membership) break

        if (membership.status !== 'active') {
          await supabase
            .from('memberships')
            .update({ status: 'active' })
            .eq('id', membership.id)
        }

        // Wholesale Member: credit 1 free slice per billing cycle
        if (membership.tier === 'wholesale_member') {
          await supabase.from('wallet_transactions').insert({
            membership_id: membership.id,
            type: 'slice_earned',
            amount: 1,
            description: 'Monthly membership benefit — 1 free slice',
          })
        }

        // Send welcome email on first invoice
        if (invoice.billing_reason === 'subscription_create') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', membership.user_id)
            .single()

          if (profile) {
            const html = await render(WelcomeEmail({ name: profile.full_name, tier: membership.tier }))
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: profile.email,
              subject: "Welcome to Tania's Wholesale Club!",
              html,
            })
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: membership } = await supabase
          .from('memberships')
          .select('id, user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!membership) break

        await supabase
          .from('memberships')
          .update({ status: 'past_due' })
          .eq('id', membership.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', membership.user_id)
          .single()

        if (profile) {
          const html = await render(PaymentFailedEmail({ name: profile.full_name }))
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: profile.email,
            subject: "Payment failed — action required",
            html,
          })
        }

        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err)
    return new NextResponse('Internal error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
