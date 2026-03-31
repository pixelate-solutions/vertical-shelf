import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WalletWidget } from '@/components/member/WalletWidget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { TransactionType } from '@/types/membership'

const TX_LABEL: Record<TransactionType, string> = {
  slice_earned: 'Free slice earned',
  slice_redeemed: 'Slice redeemed',
  points_earned: 'Points earned',
  points_redeemed: 'Points redeemed',
  referral_credit: 'Referral credit',
}

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, referral_code')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const [{ data: balance }, { data: transactions }] = await Promise.all([
    supabase.from('wallet_balances').select('*').eq('membership_id', membership.id).maybeSingle(),
    supabase
      .from('wallet_transactions')
      .select('id, type, amount, description, created_at')
      .eq('membership_id', membership.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Rewards Wallet</h1>

      <WalletWidget balance={balance} referralCode={membership.referral_code} />

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {transactions?.length ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description ?? TX_LABEL[tx.type as TransactionType]}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.created_at)}</p>
                </div>
                <span className={`text-sm font-semibold ${
                  tx.type.includes('earned') || tx.type === 'referral_credit'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {tx.type.includes('redeemed') ? '−' : '+'}
                  {tx.type.includes('slice') ? `${tx.amount} slice` : `${tx.amount} pts`}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center">
              No transactions yet. Orders earn 1 point per dollar spent.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
