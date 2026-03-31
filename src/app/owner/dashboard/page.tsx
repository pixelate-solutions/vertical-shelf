import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LowStockAlert } from '@/components/owner/LowStockAlert'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import type { CatalogItem } from '@/types/database'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const [
    { data: activeOrders },
    { data: memberCounts },
    { data: allItems },
    { data: openRequests },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, status')
      .in('status', ['submitted', 'confirmed', 'ready']),
    supabase
      .from('memberships')
      .select('tier, status')
      .eq('status', 'active'),
    supabase
      .from('catalog_items')
      .select('*')
      .eq('is_active', true),
    supabase
      .from('custom_requests')
      .select('id')
      .in('status', ['open', 'in_review']),
  ])

  const lowStockItems = (allItems ?? []).filter(
    (item) => item.stock_qty <= item.low_stock_threshold
  ) as CatalogItem[]

  const activeOrderCount = activeOrders?.length ?? 0
  const activeOrderValue = activeOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0

  const tierBreakdown = {
    slice_club: memberCounts?.filter((m) => m.tier === 'slice_club').length ?? 0,
    wholesale_member: memberCounts?.filter((m) => m.tier === 'wholesale_member').length ?? 0,
    business_partner: memberCounts?.filter((m) => m.tier === 'business_partner').length ?? 0,
  }

  const mrr =
    tierBreakdown.slice_club * 9 +
    tierBreakdown.wholesale_member * 29 +
    tierBreakdown.business_partner * 79

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{activeOrderCount}</p>
            <p className="text-xs text-gray-400 mt-1">{formatCurrency(activeOrderValue)} total value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{memberCounts?.length ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              {tierBreakdown.slice_club}SC · {tierBreakdown.wholesale_member}WM · {tierBreakdown.business_partner}BP
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Est. MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(mrr)}</p>
            <p className="text-xs text-gray-400 mt-1">membership fees only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{openRequests?.length ?? 0}</p>
            <Link href="/owner/requests" className="text-xs text-red-600 hover:underline mt-1 block">
              View requests →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory alerts</h2>
        <LowStockAlert items={lowStockItems} />
      </div>
    </div>
  )
}
