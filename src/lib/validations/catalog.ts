import { z } from 'zod'

export const upsertCatalogItemSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  unit_label: z.string().min(1).max(80),
  base_price: z.number().positive(),
  min_tier: z.enum(['slice_club', 'wholesale_member', 'business_partner']),
  is_active: z.boolean().default(true),
  stock_qty: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(10),
  supplier_name: z.string().max(120).optional(),
  supplier_contact: z.string().max(200).optional(),
  supplier_sku: z.string().max(80).optional(),
  sort_order: z.number().int().min(0).default(0),
})

export type UpsertCatalogItemInput = z.infer<typeof upsertCatalogItemSchema>
