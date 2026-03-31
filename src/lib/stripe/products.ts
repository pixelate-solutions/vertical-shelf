import type { MembershipTier } from '@/types/membership'

export const TIER_PRICE_MAP: Record<MembershipTier, string> = {
  slice_club: process.env.STRIPE_PRICE_SLICE_CLUB!,
  wholesale_member: process.env.STRIPE_PRICE_WHOLESALE_MEMBER!,
  business_partner: process.env.STRIPE_PRICE_BUSINESS_PARTNER!,
}

export function getPriceTierMap(): Record<string, MembershipTier> {
  return {
    [process.env.STRIPE_PRICE_SLICE_CLUB!]: 'slice_club',
    [process.env.STRIPE_PRICE_WHOLESALE_MEMBER!]: 'wholesale_member',
    [process.env.STRIPE_PRICE_BUSINESS_PARTNER!]: 'business_partner',
  }
}
