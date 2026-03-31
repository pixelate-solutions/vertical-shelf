'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CatalogItem } from '@/types/database'

interface Props {
  items: CatalogItem[]
}

export function LowStockAlert({ items }: Props) {
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)

  async function sendReorder(itemId: string) {
    setLoading(itemId)
    try {
      await fetch('/api/inventory/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      })
      setSent((s) => new Set([...s, itemId]))
    } finally {
      setLoading(null)
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">All items are well-stocked.</p>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3"
        >
          <div>
            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.stock_qty} remaining · threshold: {item.low_stock_threshold}
              {item.supplier_name && ` · ${item.supplier_name}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="warning">Low stock</Badge>
            {sent.has(item.id) ? (
              <span className="text-xs text-green-600 font-medium">Alert sent</span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                loading={loading === item.id}
                onClick={() => sendReorder(item.id)}
              >
                Send reorder alert
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
