import { createClient } from '@/lib/supabase/server'
import { PickupPlanner } from '@/components/member/PickupPlanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PickupPage() {
  const supabase = await createClient()

  const { data: windows } = await supabase
    .from('pickup_windows')
    .select('*')
    .eq('is_active', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-[#bf3425]">Pickup planning</p>
        <h1 className="mt-2 font-serif text-4xl text-[#221811]">Schedule your order pickup</h1>
      </div>

      <p className="text-[#6f5a49]">
        Wholesale Members: submit your order by <strong>Sunday</strong> to have it ready for the
        <strong> Tuesday batch pickup window</strong>. Orders are batched to give the kitchen time
        to prep and order supplies.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Available pickup windows</CardTitle>
        </CardHeader>
        <CardContent>
          <PickupPlanner windows={windows ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
