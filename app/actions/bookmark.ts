"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"

/**
 * Toggle bookmark on a post
 */
export async function toggleBookmark(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Check if already bookmarked
  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  })

  if (existingBookmark) {
    // Remove bookmark
    await prisma.bookmark.delete({
      where: {
        id: existingBookmark.id,
      },
    })
  } else {
    // Add bookmark
    await prisma.bookmark.create({
      data: {
        postId,
        userId: session.user.id,
      },
    })
  }

  revalidatePath("/feed")
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

/**
 * Get bookmark status for a post
 */
export async function getBookmarkStatus(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { isBookmarked: false }
  }

  // Safety check
  if (!prisma.bookmark) {
    return { isBookmarked: false }
  }

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    })

    return {
      isBookmarked: !!bookmark,
    }
  } catch (error) {
    console.error("Error fetching bookmark status:", error)
    return { isBookmarked: false }
  }
}

