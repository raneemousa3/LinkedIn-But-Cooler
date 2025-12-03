"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "@/lib/validations/post"
import { revalidatePath } from "next/cache"

/**
 * Get all posts for the feed (ordered by newest first)
 */
export async function getPosts(limit: number = 100) {
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return posts
}

/**
 * Get a single post by ID
 */
export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return post
}

/**
 * Get posts by a specific user ID
 */
export async function getPostsByUser(userId: string, limit: number = 50) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return posts
}

/**
 * Create a new post
 */
export async function createPost(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createPostSchema.parse(data)

  const post = await prisma.post.create({
    data: {
      content: validated.content ?? null,
      imageUrl: validated.imageUrl ?? null,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/feed")
  return post
}

/**
 * Update a post
 */
export async function updatePost(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = updatePostSchema.parse(data)

  // Verify the post belongs to the current user
  const existing = await prisma.post.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.authorId !== session.user.id) {
    throw new Error("Post not found or unauthorized")
  }

  const post = await prisma.post.update({
    where: { id: validated.id },
    data: {
      content: validated.content ?? null,
      imageUrl: validated.imageUrl ?? null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/feed")
  return post
}

/**
 * Delete a post
 */
export async function deletePost(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = deletePostSchema.parse(data)

  // Verify the post belongs to the current user
  const existing = await prisma.post.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.authorId !== session.user.id) {
    throw new Error("Post not found or unauthorized")
  }

  await prisma.post.delete({
    where: { id: validated.id },
  })

  revalidatePath("/feed")
  return { success: true }
}


