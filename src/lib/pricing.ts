import type { MembershipTier } from '@/types/membership'
import { getDiscountPct } from '@/types/membership'

export interface PricingResult {
  subtotal: number
  discountPct: number
  discountAmt: number
  total: number
}

export function calculateOrderPricing(
  subtotal: number,
  tier: MembershipTier,
  customDiscountPct?: number | null
): PricingResult {
  const discountPct = getDiscountPct(tier, customDiscountPct)
  const discountAmt = Math.round(subtotal * (discountPct / 100) * 100) / 100
  const total = Math.round((subtotal - discountAmt) * 100) / 100
  return { subtotal, discountPct, discountAmt, total }
}

export function applyDiscount(
  basePrice: number,
  tier: MembershipTier,
  customDiscountPct?: number | null
): number {
  const discountPct = getDiscountPct(tier, customDiscountPct)
  return Math.round(basePrice * (1 - discountPct / 100) * 100) / 100
}
