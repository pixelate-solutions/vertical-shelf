import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RequestForm } from '@/components/member/RequestForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { RequestStatus } from '@/types/membership'

const STATUS_META: Record<RequestStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'blue' | 'danger' }> = {
  open: { label: 'Open', variant: 'default' },
  in_review: { label: 'In review', variant: 'warning' },
  quoted: { label: 'Quoted', variant: 'blue' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'danger' },
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: requests } = await supabase
    .from('custom_requests')
    .select('id, subject, status, quoted_price, created_at')
    .eq('membership_id', membership.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Custom Requests</h1>
      <p className="text-gray-500">
        Need something special? Catering, bulk quantities, or custom combinations? Send us a request
        and Tania will get back to you with a quote.
      </p>

      <Card>
        <CardHeader><CardTitle>New request</CardTitle></CardHeader>
        <CardContent>
          <RequestForm />
        </CardContent>
      </Card>

      {requests?.length ? (
        <Card>
          <CardHeader><CardTitle>Your requests</CardTitle></CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {requests.map((req) => {
              const { label, variant } = STATUS_META[req.status as RequestStatus]
              return (
                <div key={req.id} className="flex justify-between items-start py-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{req.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(req.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.quoted_price && (
                      <span className="text-sm font-medium text-gray-700">
                        ${Number(req.quoted_price).toFixed(2)}
                      </span>
                    )}
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
