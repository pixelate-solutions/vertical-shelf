'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/member/ProductCard'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { CatalogItem } from '@/types/database'
import type { MembershipTier } from '@/types/membership'

interface CartItem {
  item: CatalogItem
  quantity: number
}

interface Props {
  catalogItems: CatalogItem[]
  memberTier: MembershipTier
  customDiscountPct: number | null
}

export function CatalogExperience({ catalogItems, memberTier, customDiscountPct }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function addToCart(item: CatalogItem, quantity: number) {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id)

      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        )
      }

      return [...prev, { item, quantity }]
    })
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((entry) => entry.item.id !== itemId))
  }

  async function submitOrder() {
    if (cart.length === 0) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((entry) => ({
            catalog_item_id: entry.item.id,
            quantity: entry.quantity,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      const json = await response.json()
      setCart([])
      router.push(`/member/orders/${json.order_id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const cartSubtotal = cart.reduce((sum, entry) => sum + entry.item.base_price * entry.quantity, 0)

  return (
    <div className="space-y-6 pb-40">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#bf3425]">Wholesale catalog</p>
          <h1 className="mt-2 font-serif text-4xl text-[#221811]">Build your next pickup order</h1>
        </div>
        {cart.length > 0 && (
          <span className="rounded-full border border-[#e6d7c3] bg-white px-4 py-2 text-sm text-[#6f5a49]">
            {cart.length} item(s) in draft
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalogItems.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            memberTier={memberTier}
            customDiscountPct={customDiscountPct}
            onAddToOrder={addToCart}
          />
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-20 rounded-[1.75rem] border border-[#eadcc7] bg-[#fffaf3]/95 p-4 shadow-[0_20px_50px_rgba(34,24,17,0.16)] backdrop-blur md:inset-x-auto md:right-7 md:w-[32rem]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8a725e]">Draft order</p>
              <div className="max-h-28 space-y-2 overflow-y-auto pr-1">
                {cart.map((entry) => (
                  <div key={entry.item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-[#3e2f24]">
                      {entry.item.name} x {entry.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(entry.item.id)}
                      className="shrink-0 text-[#8d7561] hover:text-[#bf3425]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a725e]">Subtotal</p>
              <p className="mt-1 text-2xl font-semibold text-[#221811]">
                {formatCurrency(cartSubtotal)}
              </p>
              <Button className="mt-4" size="lg" loading={submitting} onClick={submitOrder}>
                Submit order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
