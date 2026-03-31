export type MembershipTier = 'slice_club' | 'wholesale_member' | 'business_partner'
export type MembershipStatus = 'active' | 'paused' | 'pending' | 'past_due' | 'canceled'
export type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'ready' | 'picked_up' | 'canceled'
export type RequestStatus = 'open' | 'in_review' | 'quoted' | 'accepted' | 'declined'
export type TransactionType =
  | 'slice_earned'
  | 'slice_redeemed'
  | 'points_earned'
  | 'points_redeemed'
  | 'referral_credit'

export interface TierConfig {
  tier: MembershipTier
  label: string
  price: number
  discountPct: number
  description: string
  features: string[]
  color: string
  stripePriceEnvVar: string
}

export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: 'slice_club',
    label: 'Slice Club',
    price: 9,
    discountPct: 5,
    description: 'For casual buyers who want a small discount in exchange for commitment.',
    features: [
      '5% off all bulk orders',
      'Access to wholesale catalog',
      'Online order submission',
      'Pickup scheduling',
    ],
    color: 'orange',
    stripePriceEnvVar: 'STRIPE_PRICE_SLICE_CLUB',
  },
  {
    tier: 'wholesale_member',
    label: 'Wholesale Member',
    price: 29,
    discountPct: 10,
    description: 'For regulars who want serious savings and the full wholesale experience.',
    features: [
      '10% off all bulk SKUs',
      '1 free pizza slice per month',
      'Early access to specials',
      'Dedicated Sunday→Tuesday order window',
      'Rewards points on every order',
    ],
    color: 'blue',
    stripePriceEnvVar: 'STRIPE_PRICE_WHOLESALE_MEMBER',
  },
  {
    tier: 'business_partner',
    label: 'Business Partner',
    price: 79,
    discountPct: 15,
    description: 'For commercial buyers — offices, catering, and small businesses.',
    features: [
      'Custom pricing negotiated with owner',
      'Net-30 invoicing available',
      'Direct line to the owner',
      'Named account management',
      'Access to full catalog including commercial items',
      'All Wholesale Member benefits',
    ],
    color: 'purple',
    stripePriceEnvVar: 'STRIPE_PRICE_BUSINESS_PARTNER',
  },
]

export function getTierConfig(tier: MembershipTier): TierConfig {
  return TIER_CONFIGS.find((c) => c.tier === tier)!
}

export function getDiscountPct(
  tier: MembershipTier,
  customDiscountPct?: number | null
): number {
  if (tier === 'business_partner' && customDiscountPct != null) {
    return Number(customDiscountPct)
  }
  return getTierConfig(tier).discountPct
}
