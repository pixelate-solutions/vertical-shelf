import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend/client'
import { createRequestSchema } from '@/lib/validations/request'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createRequestSchema.safeParse(body)
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

  const { data: customRequest, error } = await supabase
    .from('custom_requests')
    .insert({
      membership_id: membership.id,
      subject: parsed.data.subject,
      body: parsed.data.body,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `New custom request: ${parsed.data.subject}`,
    html: `
      <p><strong>From:</strong> ${profile?.full_name ?? 'Member'} (${profile?.email})</p>
      <p><strong>Subject:</strong> ${parsed.data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${parsed.data.body.replace(/\n/g, '<br>')}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/owner/requests">View in dashboard →</a></p>
    `,
  })

  return NextResponse.json({ request_id: customRequest.id }, { status: 201 })
}
