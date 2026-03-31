import { redirect, notFound } from 'next/navigation'
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, catalog_items(name, unit_label))')
    .eq('id', id)
    .eq('membership_id', membership.id)
    .single()

  if (!order) notFound()

  const { label, variant } = STATUS_META[order.status as OrderStatus]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/member/orders" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
        </div>
        <Badge variant={variant} className="text-sm px-3 py-1">{label}</Badge>
      </div>

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
                <p className="font-medium text-gray-900">{oi.catalog_items?.name}</p>
                <p className="text-sm text-gray-500">
                  {oi.catalog_items?.unit_label} × {oi.quantity} @ {formatCurrency(oi.unit_price)}
                </p>
              </div>
              <span className="font-semibold">{formatCurrency(oi.line_total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amt > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Member discount ({order.discount_pct}% off)</span>
              <span>−{formatCurrency(order.discount_amt)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {order.submitted_at && (
        <p className="text-sm text-gray-500">
          Submitted {formatDateTime(order.submitted_at)}
        </p>
      )}
    </div>
  )
}
