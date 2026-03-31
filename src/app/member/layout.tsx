import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavShell } from '@/components/shared/NavShell'

export const dynamic = 'force-dynamic'

const memberNavItems = [
  { href: '/member/dashboard', label: 'Dashboard', icon: null },
  { href: '/member/catalog', label: 'Catalog', icon: null },
  { href: '/member/orders', label: 'My Orders', icon: null },
  { href: '/member/pickup', label: 'Schedule Pickup', icon: null },
  { href: '/member/requests', label: 'Custom Requests', icon: null },
  { href: '/member/wallet', label: 'Rewards Wallet', icon: null },
  { href: '/member/account', label: 'Account', icon: null },
]

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) redirect('/onboarding')

  return (
    <NavShell navItems={memberNavItems} title="Tania's Wholesale Club">
      {children}
    </NavShell>
  )
}
