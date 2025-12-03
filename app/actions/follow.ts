"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"

/**
 * Follow a user
 */
export async function followUser(userIdToFollow: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === userIdToFollow) {
    throw new Error("Cannot follow yourself")
  }

  // Check if already following
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: userIdToFollow,
      },
    },
  })

  if (existing) {
    return { success: true, message: "Already following" }
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: userIdToFollow,
    },
  })

  // Create notification for the user being followed
  await createNotification({
    type: "connect",
    recipientId: userIdToFollow,
    senderId: session.user.id,
  })

  revalidatePath("/feed")
  return { success: true }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userIdToUnfollow: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: userIdToUnfollow,
    },
  })

  revalidatePath("/feed")
  return { success: true }
}

/**
 * Check if current user is following a user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) {
    return false
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: userId,
      },
    },
  })

  return !!follow
}

/**
 * Get follow status for multiple users
 */
export async function getFollowStatuses(userIds: string[]): Promise<Record<string, boolean>> {
  const session = await auth()
  if (!session?.user?.id || userIds.length === 0) {
    return {}
  }

  // Safety check: if Follow model doesn't exist yet, return empty statuses
  if (!prisma.follow) {
    console.warn("Follow model not available. Make sure to create the Follow table and regenerate Prisma Client.")
    return {}
  }

  try {
    const follows = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        followingId: { in: userIds },
      },
    })

    const statusMap: Record<string, boolean> = {}
    userIds.forEach((id) => {
      statusMap[id] = false
    })
    follows.forEach((follow) => {
      statusMap[follow.followingId] = true
    })

    return statusMap
  } catch (error) {
    console.error("Error fetching follow statuses:", error)
    // Return empty statuses if there's an error (e.g., table doesn't exist)
    return {}
  }
}

