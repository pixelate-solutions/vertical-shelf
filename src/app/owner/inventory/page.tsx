import { createClient } from '@/lib/supabase/server'
import { LowStockAlert } from '@/components/owner/LowStockAlert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/member/TierBadge'
import type { CatalogItem } from '@/types/database'
import type { MembershipTier } from '@/types/membership'
import Link from 'next/link'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: allItems } = await supabase.from('catalog_items').select('*').eq('is_active', true).order('sort_order')

  const lowStockItems = (allItems ?? []).filter(
    (item) => item.stock_qty <= item.low_stock_threshold
  ) as CatalogItem[]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      {lowStockItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Needs reorder</h2>
          <LowStockAlert items={lowStockItems} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.unit_label}</p>
                </TableCell>
                <TableCell><TierBadge tier={item.min_tier as MembershipTier} /></TableCell>
                <TableCell>
                  <span className={item.stock_qty <= item.low_stock_threshold ? 'text-yellow-600 font-bold' : 'text-gray-700'}>
                    {item.stock_qty}
                  </span>
                  {item.stock_qty <= item.low_stock_threshold && <Badge variant="warning" className="ml-2">Low</Badge>}
                </TableCell>
                <TableCell className="text-gray-500">{item.low_stock_threshold}</TableCell>
                <TableCell className="text-gray-500 text-sm">{item.supplier_name ?? '—'}</TableCell>
                <TableCell>
                  <Link href={`/owner/catalog/${item.id}`} className="text-xs text-red-600 hover:underline">Edit →</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
