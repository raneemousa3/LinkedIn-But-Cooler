import { z } from "zod"

// Create event schema
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
  location: z.string().min(3, "Location is required").max(200),
  address: z.string().max(500).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
})

// Update event schema
export const updateEventSchema = createEventSchema.extend({
  id: z.string().min(1, "Event ID is required"),
})

// Delete event schema
export const deleteEventSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
})

