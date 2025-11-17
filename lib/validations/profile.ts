import { z } from "zod"

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  skills: z.array(z.string().min(1)).max(20, "Maximum 20 skills allowed").optional(),
  tools: z.array(z.string().min(1)).max(20, "Maximum 20 tools allowed").optional(),
})

// Portfolio item schema
export const portfolioItemSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  title: z.string().max(100, "Title must be less than 100 characters").optional().nullable(),
  description: z.string().max(500, "Description must be less than 500 characters").optional().nullable(),
  order: z.number().int().min(0).optional(),
})

// Create portfolio item schema
export const createPortfolioItemSchema = portfolioItemSchema

// Update portfolio item schema
export const updatePortfolioItemSchema = portfolioItemSchema.extend({
  id: z.string().min(1, "Portfolio item ID is required"),
})

// Delete portfolio item schema
export const deletePortfolioItemSchema = z.object({
  id: z.string().min(1, "Portfolio item ID is required"),
})


