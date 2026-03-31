import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { resend } from '@/lib/resend/client'
import { calculateOrderPricing } from '@/lib/pricing'
import { createOrderSchema } from '@/lib/validations/order'
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { items, pickup_window_id, notes } = parsed.data

  // Get membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('id, tier, status, custom_discount_pct, net30_enabled, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.status !== 'active') {
    return NextResponse.json({ error: 'Active membership required' }, { status: 403 })
  }

  // Fetch catalog items and verify tier access
  const itemIds = items.map((i) => i.catalog_item_id)
  const { data: catalogItems } = await supabase
    .from('catalog_items')
    .select('id, name, base_price, min_tier, is_active, stock_qty')
    .in('id', itemIds)

  if (!catalogItems || catalogItems.length !== itemIds.length) {
    return NextResponse.json({ error: 'One or more items not found' }, { status: 400 })
  }

  // Validate tier access
  const tierOrder: Record<string, number> = { slice_club: 0, wholesale_member: 1, business_partner: 2 }
  for (const ci of catalogItems) {
    if (tierOrder[ci.min_tier] > tierOrder[membership.tier]) {
      return NextResponse.json(
        { error: `Item "${ci.name}" requires a higher membership tier` },
        { status: 403 }
      )
    }
  }

  // Build line items
  const orderItems = items.map((item) => {
    const ci = catalogItems.find((c) => c.id === item.catalog_item_id)!
    return {
      catalog_item_id: item.catalog_item_id,
      quantity: item.quantity,
      unit_price: ci.base_price,
      line_total: ci.base_price * item.quantity,
    }
  })

  const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0)
  const pricing = calculateOrderPricing(subtotal, membership.tier, membership.custom_discount_pct)

  // Create draft order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      membership_id: membership.id,
      status: 'submitted',
      subtotal: pricing.subtotal,
      discount_pct: pricing.discountPct,
      discount_amt: pricing.discountAmt,
      total: pricing.total,
      pickup_window_id: pickup_window_id ?? null,
      notes: notes ?? null,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Insert line items
  await supabase.from('order_items').insert(
    orderItems.map((oi) => ({ ...oi, order_id: order.id }))
  )

  // Award points (1 point per dollar spent)
  await supabase.from('wallet_transactions').insert({
    membership_id: membership.id,
    type: 'points_earned',
    amount: Math.floor(pricing.total),
    description: `Points earned on order #${order.id.slice(0, 8).toUpperCase()}`,
    order_id: order.id,
  })

  // Create payment intent (skip for net-30 — invoice created separately)
  if (!membership.net30_enabled && membership.stripe_customer_id) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.total * 100),
      currency: 'usd',
      customer: membership.stripe_customer_id,
      metadata: { order_id: order.id },
    })
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id)
  }

  // Send confirmation email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  if (profile) {
    const html = await render(
      OrderConfirmationEmail({
        name: profile.full_name,
        orderId: order.id,
        items: orderItems.map((oi) => {
          const ci = catalogItems.find((c) => c.id === oi.catalog_item_id)!
          return { name: ci.name, quantity: oi.quantity, lineTotal: oi.line_total }
        }),
        subtotal: pricing.subtotal,
        discountAmt: pricing.discountAmt,
        total: pricing.total,
      })
    )
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: profile.email,
      subject: `Order confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    })
  }

  return NextResponse.json({ order_id: order.id }, { status: 201 })
}
