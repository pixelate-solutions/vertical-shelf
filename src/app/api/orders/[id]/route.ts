import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatusSchema } from '@/lib/validations/order'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only owner can update order status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('id', user.id)
    .single()

  if (!profile?.is_owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateOrderStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    owner_notes: parsed.data.owner_notes ?? null,
  }

  if (parsed.data.status === 'confirmed') updates.confirmed_at = new Date().toISOString()
  if (parsed.data.status === 'ready') updates.ready_at = new Date().toISOString()
  if (parsed.data.status === 'picked_up') updates.picked_up_at = new Date().toISOString()

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
