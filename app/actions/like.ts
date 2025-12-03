"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 */
export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    })
  } else {
    // Like
    await prisma.like.create({
      data: {
        postId,
        userId: session.user.id,
      },
    })

    // Get post author to send notification
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    // Create notification for post author
    if (post && post.authorId !== session.user.id) {
      await createNotification({
        type: "like",
        recipientId: post.authorId,
        senderId: session.user.id,
        postId,
      })
    }
  }

  revalidatePath("/feed")
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

/**
 * Get like status for a post (whether current user has liked it)
 */
export async function getLikeStatus(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { isLiked: false, count: 0 }
  }

  // Safety check
  if (!prisma.like) {
    return { isLiked: false, count: 0 }
  }

  try {
    const [isLiked, count] = await Promise.all([
      prisma.like.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id,
          },
        },
      }),
      prisma.like.count({
        where: { postId },
      }),
    ])

    return {
      isLiked: !!isLiked,
      count,
    }
  } catch (error) {
    console.error("Error fetching like status:", error)
    return { isLiked: false, count: 0 }
  }
}

/**
 * Get like counts for multiple posts
 */
export async function getLikeCounts(postIds: string[]) {
  const counts = await prisma.like.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
    },
    _count: true,
  })

  const countMap: Record<string, number> = {}
  counts.forEach((c) => {
    countMap[c.postId] = c._count
  })

  return countMap
}

