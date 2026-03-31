'use client'

import { cn, formatDateTime } from '@/lib/utils'
import type { PickupWindow } from '@/types/database'

interface Props {
  windows: PickupWindow[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PickupScheduler({ windows, selectedId, onSelect }: Props) {
  if (windows.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No pickup windows available right now. Check back soon or contact us.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {windows.map((w) => (
        <button
          key={w.id}
          onClick={() => onSelect(w.id)}
          className={cn(
            'rounded-[1.5rem] border-2 p-4 text-left transition-colors',
            selectedId === w.id
              ? 'border-[#bf3425] bg-[#fff2ea]'
              : 'border-[#eadcc7] bg-white hover:border-[#d0b99c]'
          )}
        >
          <p className="font-semibold text-[#221811]">{w.label}</p>
          <p className="mt-0.5 text-sm text-[#725f50]">
            {formatDateTime(w.starts_at)} — {formatDateTime(w.ends_at)}
          </p>
          {w.label.toLowerCase().includes('tuesday') && (
            <span className="mt-3 inline-block rounded-full bg-[#dfeeff] px-3 py-1 text-xs font-medium text-[#1e5ca8]">
              Wholesale window
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
