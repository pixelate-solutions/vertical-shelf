import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavShell } from '@/components/shared/NavShell'

export const dynamic = 'force-dynamic'

const ownerNavItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: null },
  { href: '/owner/orders', label: 'Order Queue', icon: null },
  { href: '/owner/members', label: 'Members', icon: null },
  { href: '/owner/catalog', label: 'Catalog', icon: null },
  { href: '/owner/requests', label: 'Custom Requests', icon: null },
  { href: '/owner/revenue', label: 'Revenue', icon: null },
  { href: '/owner/inventory', label: 'Inventory', icon: null },
]

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('id', user.id)
    .single()

  if (!profile?.is_owner) redirect('/member/dashboard')

  return (
    <NavShell navItems={ownerNavItems} title="Owner Dashboard">
      {children}
    </NavShell>
  )
}
