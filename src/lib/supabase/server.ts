import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getCurrentAppUser } from '@/lib/auth'

function getBaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function createClient() {
  const client = getBaseClient()

  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({
            data: { user: await getCurrentAppUser() },
            error: null,
          }),
        }
      }

      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}

export async function createServiceClient() {
  return getBaseClient()
}
