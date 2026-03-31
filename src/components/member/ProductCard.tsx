'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { applyDiscount } from '@/lib/pricing'
import type { CatalogItem } from '@/types/database'
import type { MembershipTier } from '@/types/membership'

interface Props {
  item: CatalogItem
  memberTier: MembershipTier
  customDiscountPct?: number | null
  onAddToOrder: (item: CatalogItem, quantity: number) => void
}

export function ProductCard({ item, memberTier, customDiscountPct, onAddToOrder }: Props) {
  const [qty, setQty] = useState(1)
  const discountedPrice = applyDiscount(item.base_price, memberTier, customDiscountPct)
  const isDiscounted = discountedPrice < item.base_price

  return (
    <Card className="flex flex-col overflow-hidden">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="h-44 w-full object-cover"
        />
      )}
      <CardContent className="flex flex-1 flex-col gap-4 md:pt-5 pb-5">
        <div className="flex-1">
          <h3 className="font-semibold text-[#221811]">{item.name}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-[#725f50]">{item.description}</p>
          )}
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#a08874]">{item.unit_label}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-[#221811]">
            {formatCurrency(discountedPrice)}
          </span>
          {isDiscounted && (
            <span className="text-sm text-[#9b8877] line-through">
              {formatCurrency(item.base_price)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-2xl border border-[#d9c9b6] bg-[#fff9f1]">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="rounded-l-2xl px-3 py-2 text-[#5d4c3f] hover:bg-[#f4eadc]"
            >
              −
            </button>
            <span className="w-9 text-center text-sm font-medium text-[#221811]">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="rounded-r-2xl px-3 py-2 text-[#5d4c3f] hover:bg-[#f4eadc]"
            >
              +
            </button>
          </div>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAddToOrder(item, qty)}
            disabled={item.stock_qty === 0}
          >
            {item.stock_qty === 0 ? 'Out of stock' : 'Add to order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
