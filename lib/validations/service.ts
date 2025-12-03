import { z } from "zod"

export const serviceCategorySchema = z.enum([
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Graphic Design",
  "Photography",
  "Videography",
  "Content Writing",
  "Marketing",
  "Illustration",
  "3D Modeling",
  "Animation",
  "Music Production",
  "Other",
])

export const createServiceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priceRange: z.string().min(3, "Price range is required").max(50),
  category: serviceCategorySchema.optional().nullable(),
})

