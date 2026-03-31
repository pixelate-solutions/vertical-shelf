import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'orange'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        {
          'bg-[#f1e8da] text-[#5d4c3f]': variant === 'default',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-[#fff0c8] text-[#8f5e00]': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'danger',
          'bg-[#efe5ff] text-[#6546b4]': variant === 'purple',
          'bg-[#dfeeff] text-[#1e5ca8]': variant === 'blue',
          'bg-[#ffe5c6] text-[#a85d1e]': variant === 'orange',
        },
        className
      )}
      {...props}
    />
  )
}
