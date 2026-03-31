import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(249,190,63,0.22),_transparent_30%),linear-gradient(180deg,_#fff8ec_0%,_#fffdf9_48%,_#f4ede0_100%)] px-4 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 lg:order-1">
          <div className="mx-auto max-w-md rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_30px_80px_rgba(34,24,17,0.12)] backdrop-blur">
            <div className="mb-6 text-center">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
                Back to site
              </Link>
              <h2 className="mt-4 font-serif text-4xl text-[#221811]">Create your account</h2>
              <p className="mt-2 text-sm text-[#725f50]">
                Join the club, pick a membership, then start ordering at wholesale rates.
              </p>
            </div>

            <SignUp
              path="/signup"
              routing="path"
              signInUrl="/login"
              forceRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent p-0',
                  formButtonPrimary:
                    'bg-[#bf3425] hover:bg-[#a02c20] text-white rounded-xl h-11 text-sm font-semibold shadow-none',
                  footerActionLink: 'text-[#bf3425] hover:text-[#a02c20]',
                  formFieldInput:
                    'h-11 rounded-xl border border-[#d8c7b3] bg-[#fffaf3] text-[#221811] shadow-none focus:border-[#bf3425] focus:ring-0',
                  formFieldLabel: 'text-[#5f4a3b] font-medium',
                  dividerLine: 'bg-[#eadfce]',
                  dividerText: 'text-[#8d7561]',
                  socialButtonsBlockButton:
                    'rounded-xl border border-[#e5d6c3] bg-white text-[#221811] shadow-none hover:bg-[#fffaf3]',
                  footer: 'hidden',
                },
              }}
            />
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
              Built for regulars, offices, and event buyers
            </p>
            <h1 className="mt-6 font-serif text-6xl leading-none text-[#221811]">
              Join once. Order faster. Pick up smarter.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#5d4c3f]">
              Your membership unlocks bulk pricing, custom requests, recurring rewards, and a
              cleaner ordering process for the products Tania&apos;s customers already love.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#e4d2bd] bg-white/80 p-5">
                <h3 className="font-semibold text-[#221811]">Founding tiers</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5a49]">
                  Choose Slice Club, Wholesale Member, or Business Partner and upgrade anytime.
                </p>
              </div>
              <div className="rounded-3xl border border-[#e4d2bd] bg-white/80 p-5">
                <h3 className="font-semibold text-[#221811]">Local-first pickup</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5a49]">
                  Submit orders online, then pick up from Royal Oak on your preferred schedule.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
