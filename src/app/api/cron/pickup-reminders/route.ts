import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend/client'
import { render } from '@react-email/render'
import { PickupReminderEmail } from '@/components/emails/PickupReminderEmail'
import { addHours, isBefore } from 'date-fns'

// Vercel Cron: runs daily at 9am UTC
// vercel.json: { "crons": [{ "path": "/api/cron/pickup-reminders", "schedule": "0 9 * * *" }] }
export async function GET(request: Request) {
  // Protect cron endpoint
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const now = new Date()
  const in24h = addHours(now, 24)

  // Find orders with pickup windows starting in the next 24 hours
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      pickup_window_id,
      pickup_windows(label, starts_at),
      memberships(
        user_id,
        profiles(full_name, email)
      )
    `)
    .in('status', ['submitted', 'confirmed'])
    .not('pickup_window_id', 'is', null)

  if (!orders?.length) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const order of orders) {
    const window = order.pickup_windows as unknown as { label: string; starts_at: string } | null
    if (!window) continue

    const startsAt = new Date(window.starts_at)
    if (isBefore(startsAt, now) || isBefore(in24h, startsAt)) continue

    const membership = order.memberships as unknown as { profiles: { full_name: string; email: string } } | null
    if (!membership?.profiles) continue

    const html = await render(
      PickupReminderEmail({
        name: membership.profiles.full_name,
        orderId: order.id,
        pickupLabel: window.label,
        pickupTime: window.starts_at,
      })
    )

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: membership.profiles.email,
      subject: `Pickup reminder — your order is ready tomorrow`,
      html,
    })
    sent++
  }

  return NextResponse.json({ sent })
}
