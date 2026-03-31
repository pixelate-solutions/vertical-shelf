import Link from 'next/link'
import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/member/dashboard')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(191,52,37,0.16),_transparent_34%),linear-gradient(180deg,_#fff9ef_0%,_#fffdf9_52%,_#f5efe4_100%)] px-4 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
              Tania&apos;s Pizza Wholesale Club
            </p>
            <h1 className="mt-6 font-serif text-6xl leading-none text-[#221811]">
              Sign in to keep your weekly pizza run on rails.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#5d4c3f]">
              Manage membership billing, place wholesale orders, and stay on top of pickup windows
              from one clean dashboard.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 text-sm text-[#6f5a49]">
              <span className="rounded-full border border-[#d6c0ab] bg-white/80 px-4 py-2">
                Wholesale pricing
              </span>
              <span className="rounded-full border border-[#d6c0ab] bg-white/80 px-4 py-2">
                Pickup scheduling
              </span>
              <span className="rounded-full border border-[#d6c0ab] bg-white/80 px-4 py-2">
                Stripe billing
              </span>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-md rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_30px_80px_rgba(34,24,17,0.12)] backdrop-blur">
            <div className="mb-6 text-center">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-[#bf3425]">
                Back to site
              </Link>
              <h2 className="mt-4 font-serif text-4xl text-[#221811]">Member sign in</h2>
              <p className="mt-2 text-sm text-[#725f50]">
                Use the email you want tied to your membership and order history.
              </p>
            </div>

            <SignIn
              path="/login"
              routing="path"
              signUpUrl="/signup"
              forceRedirectUrl="/member/dashboard"
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
      </div>
    </div>
  )
}
