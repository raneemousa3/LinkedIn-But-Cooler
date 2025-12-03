import { z } from "zod"

// Job type enum
export const jobTypeSchema = z.enum([
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
])

// Create job schema
export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  company: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  type: jobTypeSchema,
  compensation: z.string().max(100).optional().nullable(),
  applicationUrl: z.string().url("Must be a valid URL").optional().nullable(),
})

// Update job schema
export const updateJobSchema = createJobSchema.extend({
  id: z.string().min(1, "Job ID is required"),
})

// Delete job schema
export const deleteJobSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
})

