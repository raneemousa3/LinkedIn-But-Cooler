"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  profileUpdateSchema,
  createPortfolioItemSchema,
  updatePortfolioItemSchema,
  deletePortfolioItemSchema,
} from "@/lib/validations/profile"
import { revalidatePath } from "next/cache"

/**
 * Get the current user's profile with portfolio items
 */
export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      portfolioItems: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

/**
 * Update the current user's profile
 */
export async function updateProfile(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = profileUpdateSchema.parse(data)

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: validated.name,
      bio: validated.bio,
      skills: validated.skills,
      tools: validated.tools,
    },
  })

  revalidatePath("/profile")
  return user
}

/**
 * Create a new portfolio item for the current user
 */
export async function createPortfolioItem(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createPortfolioItemSchema.parse(data)

  // Get the highest order value for this user
  const maxOrder = await prisma.portfolioItem.findFirst({
    where: { userId: session.user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const portfolioItem = await prisma.portfolioItem.create({
    data: {
      imageUrl: validated.imageUrl,
      title: validated.title ?? null,
      description: validated.description ?? null,
      order: validated.order ?? (maxOrder?.order ?? 0) + 1,
      userId: session.user.id,
    },
  })

  revalidatePath("/profile")
  return portfolioItem
}

/**
 * Update a portfolio item
 */
export async function updatePortfolioItem(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = updatePortfolioItemSchema.parse(data)

  // Verify the portfolio item belongs to the current user
  const existing = await prisma.portfolioItem.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Portfolio item not found or unauthorized")
  }

  const portfolioItem = await prisma.portfolioItem.update({
    where: { id: validated.id },
    data: {
      imageUrl: validated.imageUrl,
      title: validated.title ?? null,
      description: validated.description ?? null,
      order: validated.order,
    },
  })

  revalidatePath("/profile")
  return portfolioItem
}

/**
 * Delete a portfolio item
 */
export async function deletePortfolioItem(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = deletePortfolioItemSchema.parse(data)

  // Verify the portfolio item belongs to the current user
  const existing = await prisma.portfolioItem.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Portfolio item not found or unauthorized")
  }

  await prisma.portfolioItem.delete({
    where: { id: validated.id },
  })

  revalidatePath("/profile")
  return { success: true }
}


