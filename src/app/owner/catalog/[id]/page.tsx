import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CatalogItemEditor } from '@/components/owner/CatalogItemEditor'

export default async function EditCatalogItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('catalog_items').select('*').eq('id', id).single()

  if (!item) {
    notFound()
  }

  return <CatalogItemEditor item={item} />
}
