'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-2xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf3425]/40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-[#bf3425] text-white hover:bg-[#a02c20]': variant === 'primary',
          'bg-[#221811] text-white hover:bg-[#3b2b21]': variant === 'secondary',
          'hover:bg-[#f5ecde] text-[#5d4c3f]': variant === 'ghost',
          'bg-red-50 text-red-700 hover:bg-red-100': variant === 'danger',
          'border border-[#d9c9b6] bg-white text-[#5d4c3f] hover:bg-[#fff5e8]': variant === 'outline',
          'h-9 px-4 text-sm': size === 'sm',
          'h-11 px-5 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
