'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RequestStatus } from '@/types/membership'

interface Request {
  id: string
  subject: string
  body: string
  status: RequestStatus
  quoted_price: number | null
  owner_notes: string | null
  created_at: string
  memberships: { profiles: { full_name: string; email: string } | null } | null
}

interface Props {
  initialRequests: Request[]
}

const STATUS_VARIANT: Record<
  RequestStatus,
  'default' | 'warning' | 'blue' | 'success' | 'danger'
> = {
  open: 'default',
  in_review: 'warning',
  quoted: 'blue',
  accepted: 'success',
  declined: 'danger',
}

export function RequestsBoard({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests)
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: RequestStatus, quotedPrice?: number) {
    setUpdating(id)

    const body: Record<string, unknown> = { status }
    if (quotedPrice !== undefined) {
      body.quoted_price = quotedPrice
    }

    const response = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? {
                ...request,
                status,
                quoted_price: quotedPrice ?? request.quoted_price,
              }
            : request
        )
      )
    }

    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-[#bf3425]">Owner inbox</p>
        <h1 className="mt-2 font-serif text-4xl text-[#221811]">Custom requests</h1>
      </div>

      {requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}

      {requests.map((request) => {
        const profile = request.memberships?.profiles
        const variant = STATUS_VARIANT[request.status]

        return (
          <Card key={request.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{request.subject}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {profile?.full_name} · {profile?.email} · {formatDate(request.created_at)}
                  </p>
                </div>
                <Badge variant={variant}>{request.status.replace('_', ' ')}</Badge>
              </div>

              <p className="whitespace-pre-wrap text-sm text-gray-700">{request.body}</p>

              {request.quoted_price && (
                <p className="text-sm font-medium text-gray-900">
                  Quoted: {formatCurrency(request.quoted_price)}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {request.status === 'open' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={updating === request.id}
                    onClick={() => updateStatus(request.id, 'in_review')}
                  >
                    Mark in review
                  </Button>
                )}
                {(request.status === 'open' || request.status === 'in_review') && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={updating === request.id}
                    onClick={() => {
                      const price = prompt('Enter quoted price:')
                      if (price) updateStatus(request.id, 'quoted', Number(price))
                    }}
                  >
                    Add quote
                  </Button>
                )}
                {request.status === 'quoted' && (
                  <>
                    <Button
                      size="sm"
                      loading={updating === request.id}
                      onClick={() => updateStatus(request.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={updating === request.id}
                      onClick={() => updateStatus(request.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
