"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"

const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(1000),
})

/**
 * Create a comment on a post
 */
export async function createComment(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Safety check
  if (!prisma.comment) {
    throw new Error("Comment model not available. Please run database migration.")
  }

  const validated = createCommentSchema.parse(data)

  const comment = await prisma.comment.create({
    data: {
      postId: validated.postId,
      userId: session.user.id,
      content: validated.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  // Get post author to send notification
  const post = await prisma.post.findUnique({
    where: { id: validated.postId },
    select: { authorId: true },
  })

  // Create notification for post author
  if (post && post.authorId !== session.user.id) {
    await createNotification({
      type: "comment",
      recipientId: post.authorId,
      senderId: session.user.id,
      postId: validated.postId,
    })
  }

  revalidatePath(`/posts/${validated.postId}`)
  return comment
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string) {
  // Safety check: if Comment model doesn't exist yet, return empty array
  if (!prisma.comment) {
    return []
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return comments
  } catch (error) {
    console.error("Error fetching comments:", error)
    return []
  }
}

/**
 * Delete a comment (only by the author)
 */
export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment || comment.userId !== session.user.id) {
    throw new Error("Comment not found or unauthorized")
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  revalidatePath(`/posts/${comment.postId}`)
  return { success: true }
}

