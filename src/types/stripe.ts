import type { MembershipTier } from './membership'

export interface StripeSubscriptionMetadata {
  app_user_id: string
  tier: MembershipTier
}

export interface StripeCustomerMetadata {
  app_user_id: string
}
