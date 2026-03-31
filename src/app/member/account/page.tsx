import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/member/TierBadge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
    supabase
      .from('memberships')
      .select('tier, status, current_period_end, referral_code')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!profile || !membership) {
    redirect('/onboarding')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-[#bf3425]">Membership account</p>
        <h1 className="mt-2 font-serif text-4xl text-[#221811]">Profile and billing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{profile.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tier</span>
            <TierBadge tier={membership.tier} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span
              className={`font-medium capitalize ${
                membership.status === 'active' ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {membership.status}
            </span>
          </div>
          {membership.current_period_end && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Next billing date</span>
              <span className="font-medium">{formatDate(membership.current_period_end)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Referral code</span>
            <span className="font-mono font-medium text-gray-700">{membership.referral_code}</span>
          </div>
          <form action="/api/stripe/create-portal" method="post" className="pt-2">
            <Button variant="outline" className="w-full">
              Manage billing & subscription
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
