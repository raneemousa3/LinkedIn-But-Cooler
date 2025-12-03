"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const createMoodBoardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
})

const addItemToMoodBoardSchema = z.object({
  moodBoardId: z.string().min(1),
  postId: z.string().optional(),
  portfolioItemId: z.string().optional(),
  imageUrl: z.string().optional(),
})

/**
 * Get all mood boards for the current user
 */
export async function getMoodBoards() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // Safety check
  if (!prisma.moodBoard) {
    return []
  }

  try {
    const moodBoards = await prisma.moodBoard.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          take: 4, // Get first 4 items for preview
          select: {
            id: true,
            imageUrl: true,
            postId: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return moodBoards
  } catch (error: any) {
    console.error("Error fetching mood boards:", error)
    // If table doesn't exist, return empty array
    if (error?.code === "P2021" || error?.message?.includes("does not exist") || error?.message?.includes("Unknown model")) {
      console.error("MoodBoard table does not exist. Please run the migration.")
      return []
    }
    return []
  }
}

/**
 * Create a new mood board
 */
export async function createMoodBoard(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createMoodBoardSchema.parse(data)

  try {
    const moodBoard = await prisma.moodBoard.create({
      data: {
        title: validated.title,
        description: validated.description ?? null,
        isPublic: validated.isPublic,
        ownerId: session.user.id,
      },
    })

    revalidatePath("/profile")
    return moodBoard
  } catch (error: any) {
    console.error("Error creating mood board:", error)
    
    // Check if it's a table doesn't exist error
    if (error?.code === "P2021" || error?.message?.includes("does not exist") || error?.message?.includes("Unknown model")) {
      throw new Error("MoodBoard table not found. Please run the database migration in Supabase. Error: " + (error?.message || "Unknown error"))
    }
    
    // Check for foreign key constraint errors
    if (error?.code === "P2003") {
      throw new Error("Invalid user ID. Please make sure you're logged in.")
    }
    
    // Check for unique constraint errors
    if (error?.code === "P2002") {
      throw new Error("A moodboard with this name already exists.")
    }
    
    // Return more detailed error message
    const errorMessage = error?.message || "Unknown error occurred"
    throw new Error(`Failed to create mood board: ${errorMessage}`)
  }
}

/**
 * Add an item to a mood board
 */
export async function addItemToMoodBoard(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Safety check
  if (!prisma.moodBoard || !prisma.moodBoardItem) {
    throw new Error("MoodBoard model not available")
  }

  const validated = addItemToMoodBoardSchema.parse(data)

  // Verify user owns the mood board
  const moodBoard = await prisma.moodBoard.findUnique({
    where: { id: validated.moodBoardId },
  })

  if (!moodBoard || moodBoard.ownerId !== session.user.id) {
    throw new Error("Mood board not found or unauthorized")
  }

  // Get the highest order value for this mood board
  const maxOrder = await prisma.moodBoardItem.findFirst({
    where: { moodBoardId: validated.moodBoardId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  // Get image URL from post if postId is provided
  let imageUrl = validated.imageUrl
  if (validated.postId && !imageUrl) {
    const post = await prisma.post.findUnique({
      where: { id: validated.postId },
      select: { imageUrl: true },
    })
    imageUrl = post?.imageUrl ?? null
  }

  const item = await prisma.moodBoardItem.create({
    data: {
      moodBoardId: validated.moodBoardId,
      postId: validated.postId ?? null,
      portfolioItemId: validated.portfolioItemId ?? null,
      imageUrl: imageUrl ?? null,
      order: (maxOrder?.order ?? 0) + 1,
    },
  })

  revalidatePath("/profile")
  return item
}

/**
 * Check if a post is already saved in any mood board
 */
export async function isPostSaved(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { isSaved: false, moodBoardIds: [] }
  }

  // Safety check
  if (!prisma.moodBoardItem) {
    return { isSaved: false, moodBoardIds: [] }
  }

  try {
    // Get all user's mood boards
    const userMoodBoards = await prisma.moodBoard.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    const moodBoardIds = userMoodBoards.map((mb) => mb.id)

    if (moodBoardIds.length === 0) {
      return { isSaved: false, moodBoardIds: [] }
    }

    // Check if post is in any of user's mood boards
    const savedItems = await prisma.moodBoardItem.findMany({
      where: {
        postId,
        moodBoardId: { in: moodBoardIds },
      },
      select: {
        moodBoardId: true,
      },
    })

    return {
      isSaved: savedItems.length > 0,
      moodBoardIds: savedItems.map((item) => item.moodBoardId),
    }
  } catch (error) {
    console.error("Error checking if post is saved:", error)
    return { isSaved: false, moodBoardIds: [] }
  }
}

