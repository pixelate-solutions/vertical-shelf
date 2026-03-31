import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/owner/RevenueChart'
import { formatCurrency } from '@/lib/utils'
import { subWeeks, startOfWeek, format } from 'date-fns'

export default async function RevenuePage() {
  const supabase = await createClient()

  const since = subWeeks(new Date(), 12).toISOString()
  const [{ data: orders }, { data: members }] = await Promise.all([
    supabase
      .from('orders')
      .select('total, submitted_at, status')
      .in('status', ['confirmed', 'ready', 'picked_up'])
      .gte('submitted_at', since),
    supabase.from('memberships').select('tier').eq('status', 'active'),
  ])

  const weekMap: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i))
    const key = format(weekStart, 'MMM d')
    weekMap[key] = { revenue: 0, orders: 0 }
  }

  orders?.forEach((order) => {
    const date = order.submitted_at ? new Date(order.submitted_at) : null
    if (!date) return
    const key = format(startOfWeek(date), 'MMM d')
    if (weekMap[key]) {
      weekMap[key].revenue += Number(order.total)
      weekMap[key].orders += 1
    }
  })

  const chartData = Object.entries(weekMap).map(([week, v]) => ({ week, ...v }))

  const tierCounts = {
    slice_club: members?.filter((m) => m.tier === 'slice_club').length ?? 0,
    wholesale_member: members?.filter((m) => m.tier === 'wholesale_member').length ?? 0,
    business_partner: members?.filter((m) => m.tier === 'business_partner').length ?? 0,
  }
  const mrr = tierCounts.slice_club * 9 + tierCounts.wholesale_member * 29 + tierCounts.business_partner * 79
  const totalOrderRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Monthly MRR</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(mrr)}</p>
            <p className="text-xs text-gray-400 mt-1">membership fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Order Revenue (12w)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalOrderRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">bulk orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Active Members</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{members?.length ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              {tierCounts.slice_club}SC · {tierCounts.wholesale_member}WM · {tierCounts.business_partner}BP
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly order revenue (last 12 weeks)</CardTitle></CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}
