import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend/client'
import { render } from '@react-email/render'
import { ReorderAlertEmail } from '@/components/emails/ReorderAlertEmail'

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
  const { item_id } = body

  const { data: item } = await supabase
    .from('catalog_items')
    .select('name, stock_qty, supplier_name, supplier_contact, supplier_sku')
    .eq('id', item_id)
    .single()

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const html = await render(
    ReorderAlertEmail({
      itemName: item.name,
      stockQty: item.stock_qty,
      supplierName: item.supplier_name ?? 'Unknown',
      supplierContact: item.supplier_contact ?? 'N/A',
      supplierSku: item.supplier_sku ?? 'N/A',
    })
  )

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `Reorder needed: ${item.name}`,
    html,
  })

  return NextResponse.json({ success: true })
}
