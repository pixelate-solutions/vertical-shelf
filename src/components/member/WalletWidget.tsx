import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WalletBalance } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

interface Props {
  balance: WalletBalance | null
  referralCode: string
}

export function WalletWidget({ balance, referralCode }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500 font-medium">Pizza Slices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">
            {balance?.slice_balance ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">free slices available</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500 font-medium">Points</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {balance?.points_balance ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">1 point per $1 spent</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500 font-medium">Referral Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(balance?.referral_credits ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your code:{' '}
            <span className="font-mono font-medium text-gray-600">{referralCode}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
