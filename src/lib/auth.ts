import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>

export interface AppAuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
  }
}

let adminClient: ReturnType<typeof createSupabaseClient> | null = null

function getAdminClient() {
  if (!adminClient) {
    adminClient = createSupabaseClient(
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

  return adminClient
}

function getPrimaryEmail(user: ClerkUser) {
  return (
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    `${user.id}@users.clerk.local`
  )
}

function getDisplayName(user: ClerkUser, email: string) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  if (fullName) return fullName
  if (user.username) return user.username

  return email.split('@')[0] ?? 'Member'
}

async function syncProfile(userId: string, fullName: string, email: string) {
  const supabase = getAdminClient() as unknown as {
    from: (table: 'profiles') => {
      upsert: (
        values: {
          id: string
          full_name: string
          email: string
        },
        options: {
          onConflict: string
          ignoreDuplicates: boolean
        }
      ) => Promise<unknown>
    }
  }

  await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: fullName,
      email,
    },
    {
      onConflict: 'id',
      ignoreDuplicates: false,
    }
  )
}

export async function getCurrentAppUser(): Promise<AppAuthUser | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await currentUser()

  if (!user) {
    return null
  }

  const email = getPrimaryEmail(user)
  const fullName = getDisplayName(user, email)

  await syncProfile(userId, fullName, email)

  return {
    id: userId,
    email,
    user_metadata: {
      full_name: fullName,
    },
  }
}
