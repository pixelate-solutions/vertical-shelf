'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TIER_CONFIGS } from '@/types/membership'
import type { MembershipTier } from '@/types/membership'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const [loading, setLoading] = useState<MembershipTier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function getResponsePayload(response: Response) {
    const text = await response.text()

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text) as { error?: string; url?: string }
    } catch {
      return { error: text }
    }
  }

  async function selectTier(tier: MembershipTier) {
    setLoading(tier)
    setError(null)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const payload = await getResponsePayload(res)

      if (!res.ok) {
        throw new Error(payload?.error ?? 'Failed to create checkout session')
      }

      if (!payload?.url) {
        throw new Error('Stripe checkout URL was not returned')
      }

      router.push(payload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Choose your membership</h1>
          <p className="mt-3 text-gray-500">
            You&apos;re one step away from wholesale pricing. Pick a tier — you can upgrade anytime.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIER_CONFIGS.map((tier) => (
            <div
              key={tier.tier}
              className={`rounded-2xl border-2 p-8 flex flex-col bg-white ${
                tier.tier === 'wholesale_member'
                  ? 'border-blue-400 shadow-md'
                  : 'border-gray-200'
              }`}
            >
              {tier.tier === 'wholesale_member' && (
                <span className="inline-block self-start rounded-full bg-blue-600 text-white text-xs font-medium px-3 py-1 mb-4">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900">{tier.label}</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(tier.price)}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
              <ul className="mt-5 space-y-2 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={tier.tier === 'wholesale_member' ? 'primary' : 'secondary'}
                size="lg"
                loading={loading === tier.tier}
                disabled={loading !== null && loading !== tier.tier}
                onClick={() => selectTier(tier.tier)}
              >
                Choose {tier.label}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Secure payment via Stripe. Cancel anytime from your account settings.
        </p>
      </div>
    </div>
  )
}
