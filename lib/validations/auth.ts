import { z } from "zod"

// Placeholder for auth validation schemas
// Will be expanded when implementing auth forms

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})



