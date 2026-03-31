import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  href?: string | null
  className?: string
  compact?: boolean
}

export function BrandMark({ href = '/', className, compact = false }: Props) {
  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/brand/pizza-badge.svg"
        alt="Tania's Pizza badge"
        width={compact ? 40 : 48}
        height={compact ? 40 : 48}
        className="shrink-0"
      />
      <span className="leading-none">
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
          Tania&apos;s Pizza
        </span>
        <span className={cn('mt-1 block font-serif text-[#221811]', compact ? 'text-lg' : 'text-xl')}>
          Wholesale Club
        </span>
      </span>
    </span>
  )

  if (!href) {
    return content
  }

  return <Link href={href}>{content}</Link>
}
