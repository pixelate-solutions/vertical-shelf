// Auto-generate in production with: npx supabase gen types typescript --local > src/types/database.ts
// This file provides hand-authored types until Supabase CLI is configured.

import type {
  MembershipTier,
  MembershipStatus,
  OrderStatus,
  RequestStatus,
  TransactionType,
} from './membership'

export interface Profile {
  id: string
  full_name: string
  business_name: string | null
  phone: string | null
  email: string
  is_owner: boolean
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string
  tier: MembershipTier
  status: MembershipStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  approved_at: string | null
  approved_by: string | null
  net30_enabled: boolean
  custom_discount_pct: number | null
  referral_code: string
  referred_by: string | null
  created_at: string
  updated_at: string
}

export interface CatalogItem {
  id: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  unit_label: string
  base_price: number
  min_tier: MembershipTier
  is_active: boolean
  stock_qty: number
  low_stock_threshold: number
  supplier_name: string | null
  supplier_contact: string | null
  supplier_sku: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PickupWindow {
  id: string
  label: string
  starts_at: string
  ends_at: string
  max_orders: number
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  membership_id: string
  status: OrderStatus
  subtotal: number
  discount_pct: number
  discount_amt: number
  total: number
  pickup_window_id: string | null
  notes: string | null
  stripe_payment_intent_id: string | null
  stripe_invoice_id: string | null
  owner_notes: string | null
  submitted_at: string | null
  confirmed_at: string | null
  ready_at: string | null
  picked_up_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  catalog_item_id: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

export interface CustomRequest {
  id: string
  membership_id: string
  subject: string
  body: string
  status: RequestStatus
  quoted_price: number | null
  owner_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  membership_id: string
  type: TransactionType
  amount: number
  description: string | null
  order_id: string | null
  created_at: string
}

export interface WalletBalance {
  membership_id: string
  slice_balance: number
  points_balance: number
  referral_credits: number
  updated_at: string
}
