import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import type { OrderStatus } from '@/types/membership'

const STATUS_META: Record<OrderStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'blue' | 'danger' }> = {
  draft: { label: 'Draft', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'blue' },
  ready: { label: 'Ready for pickup', variant: 'success' },
  picked_up: { label: 'Picked up', variant: 'default' },
  canceled: { label: 'Canceled', variant: 'danger' },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total, submitted_at, created_at')
    .eq('membership_id', membership.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {orders?.length ? (
        <div className="space-y-2">
          {orders.map((order) => {
            const { label, variant } = STATUS_META[order.status as OrderStatus]
            return (
              <Link
                key={order.id}
                href={`/member/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.submitted_at
                      ? formatDateTime(order.submitted_at)
                      : formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/member/catalog" className="text-red-600 font-medium hover:underline">
            Browse the catalog →
          </Link>
        </div>
      )}
    </div>
  )
}
