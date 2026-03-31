'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import type { Order } from '@/types/database'
import type { OrderStatus } from '@/types/membership'
import { useRouter } from 'next/navigation'

interface Props {
  orders: (Order & { profiles?: { full_name: string } | null })[]
}

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'blue' | 'purple' | 'orange' | 'danger' }> = {
  draft: { label: 'Draft', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'blue' },
  ready: { label: 'Ready', variant: 'success' },
  picked_up: { label: 'Picked Up', variant: 'default' },
  canceled: { label: 'Canceled', variant: 'danger' },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  submitted: 'confirmed',
  confirmed: 'ready',
  ready: 'picked_up',
}

export function OrderQueue({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  async function advance(orderId: string, nextStatus: OrderStatus) {
    setLoading(orderId)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      )
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'submitted', 'confirmed', 'ready'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              filter === s
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((order) => {
            const { label, variant } = STATUS_BADGE[order.status]
            const next = NEXT_STATUS[order.status]
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/owner/orders/${order.id}`} className="font-mono text-xs text-red-600 hover:underline">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell>{order.profiles?.full_name ?? '—'}</TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-gray-500">
                  {order.submitted_at ? formatDateTime(order.submitted_at) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={variant as Parameters<typeof Badge>[0]['variant']}>{label}</Badge>
                </TableCell>
                <TableCell>
                  {next && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={loading === order.id}
                      onClick={() => advance(order.id, next)}
                    >
                      Mark {next.replace('_', ' ')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
