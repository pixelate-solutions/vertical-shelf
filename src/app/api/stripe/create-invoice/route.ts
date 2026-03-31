import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('id', user.id)
    .single()

  if (!profile?.is_owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { order_id } = body

  const { data: order } = await supabase
    .from('orders')
    .select('*, memberships(stripe_customer_id, net30_enabled, tier)')
    .eq('id', order_id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const membership = order.memberships as unknown as { stripe_customer_id: string; net30_enabled: boolean }

  if (!membership.net30_enabled) {
    return NextResponse.json({ error: 'Net-30 not enabled for this account' }, { status: 403 })
  }

  if (!membership.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const invoice = await stripe.invoices.create({
    customer: membership.stripe_customer_id,
    collection_method: 'send_invoice',
    days_until_due: 30,
    metadata: { order_id },
  })

  await stripe.invoiceItems.create({
    customer: membership.stripe_customer_id,
    invoice: invoice.id,
    amount: Math.round(order.total * 100),
    currency: 'usd',
    description: `Wholesale order #${order_id.slice(0, 8).toUpperCase()}`,
  })

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
  await stripe.invoices.sendInvoice(invoice.id)

  await supabase
    .from('orders')
    .update({ stripe_invoice_id: invoice.id, status: 'confirmed' })
    .eq('id', order_id)

  return NextResponse.json({ invoice_id: invoice.id, hosted_invoice_url: finalizedInvoice.hosted_invoice_url })
}
