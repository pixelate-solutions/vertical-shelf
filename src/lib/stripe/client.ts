import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Proxy delegates all property access to the lazily-created Stripe instance
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getInstance()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
