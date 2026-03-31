import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateMemberSchema = z.object({
  status: z.enum(['active', 'paused', 'canceled']).optional(),
  net30_enabled: z.boolean().optional(),
  custom_discount_pct: z.number().min(0).max(100).optional().nullable(),
})

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('id', user.id)
    .single()

  if (!profile?.is_owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status
    if (parsed.data.status === 'active') {
      updates.approved_at = new Date().toISOString()
      updates.approved_by = user.id
    }
  }
  if (parsed.data.net30_enabled !== undefined) updates.net30_enabled = parsed.data.net30_enabled
  if ('custom_discount_pct' in parsed.data) updates.custom_discount_pct = parsed.data.custom_discount_pct

  const { error } = await supabase
    .from('memberships')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
