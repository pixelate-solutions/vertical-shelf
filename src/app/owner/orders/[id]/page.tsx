import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default async function OwnerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, catalog_items(name, unit_label)),
      memberships(
        tier,
        profiles(full_name, email, phone)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { label, variant } = STATUS_META[order.status as OrderStatus]
  const membership = order.memberships as unknown as { tier: string; profiles: { full_name: string; email: string; phone: string | null } } | null

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/owner/orders" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to queue
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
        </div>
        <Badge variant={variant} className="text-sm">{label}</Badge>
      </div>

      {membership?.profiles && (
        <Card>
          <CardHeader><CardTitle>Member</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{membership.profiles.full_name}</p>
            <p className="text-gray-500">{membership.profiles.email}</p>
            {membership.profiles.phone && <p className="text-gray-500">{membership.profiles.phone}</p>}
            <p className="text-gray-400 capitalize">{membership.tier?.replace(/_/g, ' ')}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {order.order_items?.map((oi: {
            id: string
            quantity: number
            unit_price: number
            line_total: number
            catalog_items: { name: string; unit_label: string } | null
          }) => (
            <div key={oi.id} className="flex justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">{oi.catalog_items?.name}</p>
                <p className="text-xs text-gray-500">{oi.catalog_items?.unit_label} × {oi.quantity}</p>
              </div>
              <span className="font-semibold text-sm">{formatCurrency(oi.line_total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amt > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({order.discount_pct}%)</span>
              <span>−{formatCurrency(order.discount_amt)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {order.submitted_at && (
        <p className="text-sm text-gray-500">Submitted {formatDateTime(order.submitted_at)}</p>
      )}
    </div>
  )
}
