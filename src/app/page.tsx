import Link from 'next/link'
import Image from 'next/image'
import { BrandMark } from '@/components/shared/BrandMark'
import { TIER_CONFIGS } from '@/types/membership'
import { formatCurrency } from '@/lib/utils'
import { siteConfig } from '@/lib/site'

const clubBenefits = [
  {
    title: 'Membership-powered savings',
    body: 'Give regulars, offices, and event buyers a wholesale path that feels intentional instead of ad hoc.',
  },
  {
    title: 'Cleaner order flow',
    body: 'Members can browse bulk SKUs, submit requests, and keep pickup organized without calling the shop.',
  },
  {
    title: 'Owner controls built in',
    body: 'Track members, approve business accounts, manage inventory, and route custom requests from one dashboard.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-[#fff9ef]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandMark compact />
          <div className="hidden text-right text-sm text-[#725f50] md:block">
            <p>{siteConfig.location}</p>
            <p>{siteConfig.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#5d4c3f] hover:text-[#221811]">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#bf3425] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a02c20]"
            >
              Join the club
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-16 pt-10 sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#bf3425]">
                Serving Royal Oak since &apos;{siteConfig.established.slice(2)}
              </p>
              <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-none text-[#221811] sm:text-6xl lg:text-7xl">
                A cleaner wholesale experience for Tania&apos;s Pizza regulars and business buyers.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d4c3f]">
                Turn repeat orders into a polished membership product with tiered pricing, Stripe
                billing, order batching, pickup scheduling, and owner-side operations in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-full bg-[#bf3425] px-6 py-3 text-sm font-semibold text-white hover:bg-[#a02c20]"
                >
                  Start a membership
                </Link>
                <a
                  href={siteConfig.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#d9c9b6] bg-white px-6 py-3 text-sm font-semibold text-[#5d4c3f] hover:bg-[#fff4e6]"
                >
                  Visit Tania&apos;s Pizza
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#6f5a49]">
                <span className="rounded-full border border-[#e3d3bf] bg-white/80 px-4 py-2">
                  Member-only pricing
                </span>
                <span className="rounded-full border border-[#e3d3bf] bg-white/80 px-4 py-2">
                  Bulk cases and event orders
                </span>
                <span className="rounded-full border border-[#e3d3bf] bg-white/80 px-4 py-2">
                  Pickup-ready workflow
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#eadcc7] bg-[#fffaf3] p-8 shadow-[0_30px_80px_rgba(34,24,17,0.12)]">
              <div className="absolute inset-0 opacity-40">
                <Image src="/brand/dough-pattern.svg" alt="" fill className="object-cover" />
              </div>
              <div className="relative">
                <BrandMark href={null} />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-[#221811] p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/60">Signature</p>
                    <p className="mt-3 font-serif text-3xl">Stuffed pies, slices, and bulk goods</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-[#eadcc7] bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8a725e]">Location</p>
                    <p className="mt-3 text-lg font-semibold text-[#221811]">{siteConfig.location}</p>
                    <p className="mt-2 text-sm text-[#6f5a49]">{siteConfig.phone}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.75rem] border border-[#eadcc7] bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8a725e]">
                        Club model
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#221811]">
                        Recurring revenue plus streamlined operations
                      </p>
                    </div>
                    <Image
                      src="/brand/pizza-badge.svg"
                      alt=""
                      width={72}
                      height={72}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
                Membership tiers
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#221811]">
                Built for casual buyers, loyal regulars, and business accounts.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {TIER_CONFIGS.map((tier) => (
                <div
                  key={tier.tier}
                  className={`rounded-[2rem] border p-8 ${
                    tier.tier === 'wholesale_member'
                      ? 'border-[#221811] bg-[#221811] text-white shadow-[0_20px_60px_rgba(34,24,17,0.18)]'
                      : 'border-[#eadcc7] bg-[#fffdf8]'
                  }`}
                >
                  {tier.tier === 'wholesale_member' && (
                    <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className={`mt-4 font-serif text-3xl ${tier.tier === 'wholesale_member' ? 'text-white' : 'text-[#221811]'}`}>
                    {tier.label}
                  </h3>
                  <p className={`mt-3 text-4xl font-semibold ${tier.tier === 'wholesale_member' ? 'text-white' : 'text-[#221811]'}`}>
                    {formatCurrency(tier.price)}
                    <span className={`ml-1 text-base font-medium ${tier.tier === 'wholesale_member' ? 'text-white/70' : 'text-[#8a725e]'}`}>
                      /mo
                    </span>
                  </p>
                  <p className={`mt-4 text-sm leading-7 ${tier.tier === 'wholesale_member' ? 'text-white/72' : 'text-[#6f5a49]'}`}>
                    {tier.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className={tier.tier === 'wholesale_member' ? 'text-[#f6b13d]' : 'text-[#bf3425]'}>
                          ●
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            {clubBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-[2rem] border border-[#eadcc7] bg-white p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#bf3425]">
                  Benefit
                </p>
                <h3 className="mt-4 font-serif text-3xl text-[#221811]">{benefit.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#6f5a49]">{benefit.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[#eadcc7] bg-[#fffaf3] p-8 lg:grid-cols-[1fr_0.8fr] lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
                Rooted in the shop
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#221811]">
                Designed around how Tania&apos;s Pizza already serves Royal Oak.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d4c3f]">
                The retail shop has been serving stuffed pizza, slices, and family recipes since
                1987. This membership layer extends that local reputation into a more structured
                wholesale flow for regular pickup customers, offices, and community events.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_40px_rgba(34,24,17,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#8a725e]">Visit the shop</p>
              <p className="mt-4 text-lg font-semibold text-[#221811]">{siteConfig.location}</p>
              <p className="mt-2 text-sm text-[#6f5a49]">{siteConfig.phone}</p>
              <div className="mt-6 space-y-2 text-sm text-[#6f5a49]">
                <p>Monday - Thursday: 10am - 8pm</p>
                <p>Friday - Saturday: 10am - 9pm</p>
                <p>Sunday: 11am - 8pm</p>
              </div>
              <a
                href={siteConfig.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-full border border-[#d9c9b6] px-5 py-3 text-sm font-semibold text-[#5d4c3f] hover:bg-[#fff4e6]"
              >
                Open official site
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 px-4 py-8 text-sm text-[#725f50] sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <BrandMark compact />
          <p>© {new Date().getFullYear()} {siteConfig.name}. Built for {siteConfig.shortName}.</p>
        </div>
      </footer>
    </div>
  )
}
