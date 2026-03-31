import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/member/TierBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { MembershipStatus, MembershipTier } from '@/types/membership'

const STATUS_VARIANT: Record<MembershipStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  paused: 'warning',
  pending: 'default',
  past_due: 'warning',
  canceled: 'danger',
}

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('memberships')
    .select('id, tier, status, created_at, net30_enabled, profiles(full_name, email, business_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <span className="text-sm text-gray-500">{members?.length ?? 0} total</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Net-30</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members?.map((m) => {
            const profile = m.profiles as unknown as { full_name: string; email: string; business_name: string | null } | null
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                  {profile?.business_name && (
                    <p className="text-xs text-gray-400">{profile.business_name}</p>
                  )}
                </TableCell>
                <TableCell><TierBadge tier={m.tier as MembershipTier} /></TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[m.status as MembershipStatus]}>
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{formatDate(m.created_at)}</TableCell>
                <TableCell>
                  {m.net30_enabled && <Badge variant="purple">Net-30</Badge>}
                </TableCell>
                <TableCell>
                  <Link href={`/owner/members/${m.id}`} className="text-xs text-red-600 hover:underline">
                    Manage →
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
