import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { TIER_PRICE_MAP } from '@/lib/stripe/products'
import type { MembershipTier } from '@/types/membership'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const tier = body.tier as MembershipTier

    if (!TIER_PRICE_MAP[tier]) {
      return NextResponse.json(
        { error: 'Missing or invalid Stripe price ID for the selected membership tier' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe secret key is not configured' }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is not configured' }, { status: 500 })
    }

    // Get or create Stripe customer
    const { data: membership } = await supabase
      .from('memberships')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let stripeCustomerId = membership?.stripe_customer_id

    if (!stripeCustomerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        name: profile?.full_name,
        metadata: { app_user_id: user.id },
      })
      stripeCustomerId = customer.id

      // Upsert membership with customer ID
      const { error: membershipError } = await supabase.from('memberships').upsert(
        {
          user_id: user.id,
          tier,
          status: 'pending',
          stripe_customer_id: stripeCustomerId,
        },
        { onConflict: 'user_id' }
      )

      if (membershipError) {
        return NextResponse.json({ error: membershipError.message }, { status: 500 })
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: TIER_PRICE_MAP[tier], quantity: 1 }],
      success_url: `${appUrl}/member/dashboard?checkout=success`,
      cancel_url: `${appUrl}/onboarding`,
      subscription_data: {
        metadata: { app_user_id: user.id, tier },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Failed to create Stripe checkout session:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
