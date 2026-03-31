import { Badge } from '@/components/ui/badge'
import type { MembershipTier } from '@/types/membership'

interface Props {
  tier: MembershipTier
  size?: 'sm' | 'md'
}

const TIER_META: Record<MembershipTier, { label: string; variant: 'orange' | 'blue' | 'purple' }> = {
  slice_club: { label: 'Slice Club', variant: 'orange' },
  wholesale_member: { label: 'Wholesale Member', variant: 'blue' },
  business_partner: { label: 'Business Partner', variant: 'purple' },
}

export function TierBadge({ tier, size = 'md' }: Props) {
  const { label, variant } = TIER_META[tier]
  return (
    <Badge
      variant={variant}
      className={size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : undefined}
    >
      {label}
    </Badge>
  )
}
