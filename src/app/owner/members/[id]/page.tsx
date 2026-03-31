import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemberDetailPanel } from '@/components/owner/MemberDetailPanel'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: member } = await supabase
    .from('memberships')
    .select(
      'id, tier, status, net30_enabled, custom_discount_pct, referral_code, profiles(full_name, email, business_name)'
    )
    .eq('id', id)
    .single()

  if (!member) {
    notFound()
  }

  return <MemberDetailPanel member={member as never} />
}
