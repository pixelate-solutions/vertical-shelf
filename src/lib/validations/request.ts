import { z } from 'zod'

export const createRequestSchema = z.object({
  subject: z.string().min(3, 'Subject is required').max(120),
  body: z.string().min(20, 'Please provide at least 20 characters of detail').max(2000),
})

export const updateRequestSchema = z.object({
  status: z.enum(['in_review', 'quoted', 'accepted', 'declined']),
  quoted_price: z.number().positive().optional(),
  owner_notes: z.string().max(500).optional(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
