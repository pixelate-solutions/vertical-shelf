import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: membership.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/member/account`,
  })

  return NextResponse.redirect(session.url, { status: 303 })
}
