import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CatalogExperience } from '@/components/member/CatalogExperience'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: items }, { data: membership }] = await Promise.all([
    supabase.from('catalog_items').select('*').eq('is_active', true).order('sort_order'),
    supabase
      .from('memberships')
      .select('id, tier, custom_discount_pct')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!membership) {
    redirect('/onboarding')
  }

  return (
    <CatalogExperience
      catalogItems={items ?? []}
      memberTier={membership.tier}
      customDiscountPct={membership.custom_discount_pct}
    />
  )
}
