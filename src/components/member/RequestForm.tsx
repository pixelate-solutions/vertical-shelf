'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRequestSchema, type CreateRequestInput } from '@/lib/validations/request'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onSuccess?: () => void
}

export function RequestForm({ onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
  })

  async function onSubmit(data: CreateRequestInput) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to submit request')
      }
      setSuccess(true)
      reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-green-800 font-semibold">Request sent!</p>
        <p className="text-green-600 text-sm mt-1">
          Tania will review your request and be in touch shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-700 underline"
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Subject"
        placeholder="e.g. Custom catering order for 50 people"
        error={errors.subject?.message}
        {...register('subject')}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Details
        </label>
        <textarea
          rows={5}
          placeholder="Describe what you need — quantities, dates, special requirements..."
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          {...register('body')}
        />
        {errors.body && (
          <p className="text-xs text-red-600">{errors.body.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">{error}</p>
      )}

      <Button type="submit" loading={submitting} size="lg">
        Send request
      </Button>
    </form>
  )
}
