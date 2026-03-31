'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode | null
}

interface Props {
  navItems: NavItem[]
  children: React.ReactNode
  title: string
}

export function NavShell({ navItems, children, title }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut({ redirectUrl: '/login' })
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8ec_0%,_#f6efe3_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 md:p-4">
        <aside
          className={cn(
            'fixed inset-y-3 left-3 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col rounded-[1.75rem] border border-[#eadcc7] bg-[#fffaf3]/95 p-3 shadow-[0_24px_60px_rgba(34,24,17,0.12)] backdrop-blur transition-transform lg:static lg:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-[110%]'
          )}
        >
          <div className="flex items-center justify-between rounded-2xl border border-[#f0e3d3] bg-white px-4 py-4">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#bf3425]">
                Tania&apos;s Pizza
              </p>
              <span className="mt-1 block font-serif text-xl text-[#221811]">{title}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-[#eadcc7] p-2 text-[#6f5a49] lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[#f0e3d3] bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a725e]">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-[#221811]">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Member'}
            </p>
            <p className="mt-1 text-xs text-[#7b6553]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-[#221811] text-white'
                    : 'text-[#5d4c3f] hover:bg-white hover:text-[#221811]'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#eadcc7] bg-white px-4 py-3 text-sm font-medium text-[#5d4c3f] hover:bg-[#fff4e6]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-[#221811]/35 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_20px_80px_rgba(34,24,17,0.08)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[#f0e5d8] px-5 py-4 md:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#bf3425]">Dashboard</p>
                <h1 className="mt-1 font-serif text-2xl text-[#221811]">{title}</h1>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-full border border-[#eadcc7] bg-white p-2 text-[#6f5a49] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 md:p-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
