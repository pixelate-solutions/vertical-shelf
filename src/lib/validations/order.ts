import { z } from 'zod'

export const orderItemSchema = z.object({
  catalog_item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  pickup_window_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'ready', 'picked_up', 'canceled']),
  owner_notes: z.string().max(500).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
