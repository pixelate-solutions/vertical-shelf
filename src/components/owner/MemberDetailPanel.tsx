'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TierBadge } from '@/components/member/TierBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MembershipTier, MembershipStatus } from '@/types/membership'

interface MemberData {
  id: string
  tier: MembershipTier
  status: MembershipStatus
  net30_enabled: boolean
  custom_discount_pct: number | null
  referral_code: string
  profiles: { full_name: string; email: string; business_name: string | null } | null
}

interface Props {
  member: MemberData
}

export function MemberDetailPanel({ member: initialMember }: Props) {
  const router = useRouter()
  const [member, setMember] = useState(initialMember)
  const [customDiscount, setCustomDiscount] = useState(
    initialMember.custom_discount_pct?.toString() ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function updateMember(updates: Record<string, unknown>) {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        return
      }

      setMember((current) => ({
        ...current,
        ...updates,
      }))
      setSuccess(true)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/owner/members" className="text-sm text-gray-500 hover:text-gray-700">
          Back to members
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-[#221811]">
          {member.profiles?.full_name ?? 'Member'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tier</span>
            <TierBadge tier={member.tier} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className="text-sm font-medium capitalize">{member.status}</span>
          </div>
          {member.profiles?.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm">{member.profiles.email}</span>
            </div>
          )}
          {member.profiles?.business_name && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Business</span>
              <span className="text-sm">{member.profiles.business_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {member.status !== 'active' && (
              <Button size="sm" loading={saving} onClick={() => updateMember({ status: 'active' })}>
                Approve / Activate
              </Button>
            )}
            {member.status === 'active' && (
              <Button
                size="sm"
                variant="danger"
                loading={saving}
                onClick={() => updateMember({ status: 'paused' })}
              >
                Pause membership
              </Button>
            )}
            <Button
              size="sm"
              variant={member.net30_enabled ? 'secondary' : 'outline'}
              loading={saving}
              onClick={() => updateMember({ net30_enabled: !member.net30_enabled })}
            >
              {member.net30_enabled ? 'Disable Net-30' : 'Enable Net-30'}
            </Button>
          </div>

          {member.tier === 'business_partner' && (
            <div className="flex items-end gap-2">
              <Input
                label="Custom discount (%)"
                type="number"
                min="0"
                max="100"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={saving}
                onClick={() =>
                  updateMember({
                    custom_discount_pct: customDiscount ? Number(customDiscount) : null,
                  })
                }
              >
                Save
              </Button>
            </div>
          )}

          {success && <p className="text-sm text-green-700">Changes saved.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
