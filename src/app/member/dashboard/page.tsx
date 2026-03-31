import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TierBadge } from '@/components/member/TierBadge'
import { WalletWidget } from '@/components/member/WalletWidget'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { OrderStatus } from '@/types/membership'

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  canceled: 'Canceled',
}

export default async function MemberDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase
      .from('memberships')
      .select('id, tier, status, current_period_end, referral_code')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!membership) redirect('/onboarding')

  const [{ data: recentOrders }, { data: walletBalance }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total, created_at')
      .eq('membership_id', membership.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('wallet_balances')
      .select('*')
      .eq('membership_id', membership.id)
      .maybeSingle(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Member'}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <TierBadge tier={membership.tier} />
          {membership.status !== 'active' && (
            <Badge variant="warning">{membership.status}</Badge>
          )}
          {membership.current_period_end && (
            <span className="text-sm text-gray-500">
              Renews {formatDate(membership.current_period_end)}
            </span>
          )}
        </div>
      </div>

      <WalletWidget balance={walletBalance} referralCode={membership.referral_code} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Link href="/member/orders" className="text-sm text-red-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders?.length ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/member/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs text-gray-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                    <Badge variant={order.status === 'ready' ? 'success' : 'default'}>
                      {STATUS_LABEL[order.status as OrderStatus]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">No orders yet.</p>
              <Link
                href="/member/catalog"
                className="text-sm text-red-600 font-medium hover:underline"
              >
                Browse the catalog →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
