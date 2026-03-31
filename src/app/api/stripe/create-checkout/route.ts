import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { TIER_PRICE_MAP } from '@/lib/stripe/products'
import type { MembershipTier } from '@/types/membership'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const tier = body.tier as MembershipTier

  if (!TIER_PRICE_MAP[tier]) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
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
    await supabase.from('memberships').upsert({
      user_id: user.id,
      tier,
      status: 'pending',
      stripe_customer_id: stripeCustomerId,
    }, { onConflict: 'user_id' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

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

  return NextResponse.json({ url: session.url })
}
