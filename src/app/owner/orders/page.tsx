import { createClient } from '@/lib/supabase/server'
import { OrderQueue } from '@/components/owner/OrderQueue'

export default async function OwnerOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      memberships(
        profiles(full_name)
      )
    `)
    .not('status', 'in', '("draft","picked_up","canceled")')
    .order('submitted_at', { ascending: true })

  const flatOrders = (orders ?? []).map((o) => ({
    ...o,
    profiles: (o.memberships as unknown as { profiles: { full_name: string } } | null)?.profiles ?? null,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Queue</h1>
      <OrderQueue orders={flatOrders} />
    </div>
  )
}
