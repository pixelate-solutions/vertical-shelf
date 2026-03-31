import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateRequestSchema } from '@/lib/validations/request'

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
  const parsed = updateRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    owner_notes: parsed.data.owner_notes ?? null,
  }

  if (parsed.data.quoted_price !== undefined) {
    updates.quoted_price = parsed.data.quoted_price
  }

  if (parsed.data.status === 'accepted' || parsed.data.status === 'declined') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase.from('custom_requests').update(updates).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
