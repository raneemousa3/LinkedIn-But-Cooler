"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { createServiceSchema } from "@/lib/validations/service"
import { revalidatePath } from "next/cache"

/**
 * Create a new service
 */
export async function createService(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createServiceSchema.parse(data)

  try {
    const service = await prisma.service.create({
      data: {
        title: validated.title,
        description: validated.description,
        priceRange: validated.priceRange,
        category: validated.category ?? null,
        providerId: session.user.id,
      },
    })

    revalidatePath("/profile")
    return service
  } catch (error: any) {
    // Check if Service table doesn't exist
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      throw new Error("Service tables do not exist. Please run the database migration.")
    }
    console.error("Error creating service:", error)
    throw error
  }
}

/**
 * Get all services for a user
 */
export async function getUserServices(userId: string) {
  try {
    const services = await prisma.service.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: "desc" },
    })
    return services
  } catch (error: any) {
    // Service table might not exist yet
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      console.warn("Service model not available. Returning empty array.")
      return []
    }
    console.error("Error fetching services:", error)
    throw error
  }
}

