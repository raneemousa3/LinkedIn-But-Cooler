import { z } from "zod"

// Base post schema (without refine)
const basePostSchema = z.object({
  content: z.string().max(1000, "Content must be less than 1000 characters").optional().nullable(),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
})

// Create post schema with validation
export const createPostSchema = basePostSchema.refine(
  (data) => data.content || data.imageUrl,
  {
    message: "Post must have either content or an image",
    path: ["content"],
  }
)

// Update post schema
export const updatePostSchema = basePostSchema.extend({
  id: z.string().min(1, "Post ID is required"),
}).refine(
  (data) => data.content || data.imageUrl,
  {
    message: "Post must have either content or an image",
    path: ["content"],
  }
)

// Delete post schema
export const deletePostSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
})

