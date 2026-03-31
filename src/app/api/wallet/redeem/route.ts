import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const redeemSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('slice'), amount: z.number().int().positive() }),
  z.object({ type: z.literal('points'), amount: z.number().int().positive() }),
])

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = redeemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.status !== 'active') {
    return NextResponse.json({ error: 'Active membership required' }, { status: 403 })
  }

  const { data: balance } = await supabase
    .from('wallet_balances')
    .select('slice_balance, points_balance')
    .eq('membership_id', membership.id)
    .single()

  if (parsed.data.type === 'slice') {
    if (!balance || balance.slice_balance < parsed.data.amount) {
      return NextResponse.json({ error: 'Insufficient slice balance' }, { status: 400 })
    }
    await supabase.from('wallet_transactions').insert({
      membership_id: membership.id,
      type: 'slice_redeemed',
      amount: parsed.data.amount,
      description: `Redeemed ${parsed.data.amount} slice(s)`,
    })
  } else {
    if (!balance || balance.points_balance < parsed.data.amount) {
      return NextResponse.json({ error: 'Insufficient points balance' }, { status: 400 })
    }
    await supabase.from('wallet_transactions').insert({
      membership_id: membership.id,
      type: 'points_redeemed',
      amount: parsed.data.amount,
      description: `Redeemed ${parsed.data.amount} points`,
    })
  }

  return NextResponse.json({ success: true })
}
