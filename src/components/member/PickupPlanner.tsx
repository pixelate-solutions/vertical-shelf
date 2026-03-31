'use client'

import { useState } from 'react'
import { PickupScheduler } from '@/components/member/PickupScheduler'
import type { PickupWindow } from '@/types/database'

interface Props {
  windows: PickupWindow[]
}

export function PickupPlanner({ windows }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <PickupScheduler windows={windows} selectedId={selectedId} onSelect={setSelectedId} />
      {selectedId && (
        <p className="mt-4 text-sm font-medium text-green-700">
          Window selected. Add it to your next order at checkout.
        </p>
      )}
    </>
  )
}
