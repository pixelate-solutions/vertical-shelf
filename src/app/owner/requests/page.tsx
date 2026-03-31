import { createClient } from '@/lib/supabase/server'
import { RequestsBoard } from '@/components/owner/RequestsBoard'

export default async function OwnerRequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('custom_requests')
    .select('*, memberships(profiles(full_name, email))')
    .order('created_at', { ascending: false })

  return <RequestsBoard initialRequests={(requests ?? []) as never[]} />
}
