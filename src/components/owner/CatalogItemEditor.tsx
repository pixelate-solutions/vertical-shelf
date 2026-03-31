'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CatalogItem } from '@/types/database'

interface Props {
  item: CatalogItem
}

export function CatalogItemEditor({ item }: Props) {
  const [form, setForm] = useState({
    name: item.name,
    description: item.description ?? '',
    unit_label: item.unit_label,
    base_price: String(item.base_price),
    stock_qty: String(item.stock_qty),
    low_stock_threshold: String(item.low_stock_threshold),
    is_active: item.is_active,
    min_tier: item.min_tier,
    supplier_name: item.supplier_name ?? '',
    supplier_contact: item.supplier_contact ?? '',
    supplier_sku: item.supplier_sku ?? '',
    slug: item.slug,
    image_url: item.image_url ?? '',
    sort_order: String(item.sort_order),
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setValue(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/catalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          ...form,
          base_price: Number(form.base_price),
          stock_qty: Number(form.stock_qty),
          low_stock_threshold: Number(form.low_stock_threshold),
          sort_order: Number(form.sort_order),
        }),
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(JSON.stringify(json.error))
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/owner/catalog" className="text-sm text-gray-500 hover:text-gray-700">
          Back to catalog
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-[#221811]">Edit catalog item</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Name" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
          </div>
          <Input label="Slug" value={form.slug} onChange={(e) => setValue('slug', e.target.value)} />
          <Input label="Image URL" value={form.image_url} onChange={(e) => setValue('image_url', e.target.value)} />
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className="block w-full rounded-2xl border border-[#d9c9b6] bg-[#fffaf3] px-4 py-3 text-sm text-[#221811] focus:border-[#bf3425] focus:outline-none"
              value={form.description}
              onChange={(e) => setValue('description', e.target.value)}
            />
          </div>
          <Input label="Unit label" value={form.unit_label} onChange={(e) => setValue('unit_label', e.target.value)} />
          <Input label="Base price ($)" type="number" step="0.01" value={form.base_price} onChange={(e) => setValue('base_price', e.target.value)} />
          <Input label="Stock qty" type="number" value={form.stock_qty} onChange={(e) => setValue('stock_qty', e.target.value)} />
          <Input label="Low stock threshold" type="number" value={form.low_stock_threshold} onChange={(e) => setValue('low_stock_threshold', e.target.value)} />
          <Input label="Sort order" type="number" value={form.sort_order} onChange={(e) => setValue('sort_order', e.target.value)} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Minimum tier</label>
            <select
              className="block h-12 w-full rounded-2xl border border-[#d9c9b6] bg-[#fffaf3] px-4 text-sm text-[#221811] focus:border-[#bf3425] focus:outline-none"
              value={form.min_tier}
              onChange={(e) => setValue('min_tier', e.target.value)}
            >
              <option value="slice_club">Slice Club</option>
              <option value="wholesale_member">Wholesale Member</option>
              <option value="business_partner">Business Partner</option>
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-[#eadcc7] bg-[#fff9f1] px-4 py-3 text-sm text-[#5d4c3f]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setValue('is_active', e.target.checked)}
              className="rounded border-gray-300"
            />
            Active and visible to members
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input label="Supplier name" value={form.supplier_name} onChange={(e) => setValue('supplier_name', e.target.value)} />
          <Input label="Supplier contact" value={form.supplier_contact} onChange={(e) => setValue('supplier_contact', e.target.value)} />
          <Input label="Supplier SKU" value={form.supplier_sku} onChange={(e) => setValue('supplier_sku', e.target.value)} />
        </CardContent>
      </Card>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm font-medium text-green-700">Saved successfully.</p>}

      <Button size="lg" loading={saving} onClick={handleSave}>
        Save changes
      </Button>
    </div>
  )
}
