import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/member/TierBadge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import type { MembershipTier } from '@/types/membership'

export default async function OwnerCatalogPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('catalog_items').select('*').order('sort_order')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
        <span className="text-sm text-gray-500">{items?.length ?? 0} SKUs</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Min Tier</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.unit_label}</p>
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(item.base_price)}</TableCell>
              <TableCell><TierBadge tier={item.min_tier as MembershipTier} /></TableCell>
              <TableCell>
                <span className={item.stock_qty <= item.low_stock_threshold ? 'text-yellow-600 font-medium' : 'text-gray-700'}>
                  {item.stock_qty}
                </span>
                <span className="text-xs text-gray-400"> / {item.low_stock_threshold}</span>
              </TableCell>
              <TableCell>
                <Badge variant={item.is_active ? 'success' : 'default'}>
                  {item.is_active ? 'Active' : 'Hidden'}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/owner/catalog/${item.id}`} className="text-xs text-red-600 hover:underline">
                  Edit →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
