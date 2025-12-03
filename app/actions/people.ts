"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"

/**
 * Get all users (people) excluding the current user
 */
export async function getPeople(limit: number = 50) {
  const session = await auth()
  const currentUserId = session?.user?.id

  const users = await prisma.user.findMany({
    take: limit,
    where: currentUserId
      ? {
          id: {
            not: currentUserId,
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      skills: true,
      tools: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get follower counts separately (if Follow table exists)
  let followerCountMap = new Map<string, number>()
  
  try {
    if (prisma.follow && users.length > 0) {
      const userIds = users.map((user) => user.id)
      const followerCounts = await prisma.follow.groupBy({
        by: ["followingId"],
        where: {
          followingId: { in: userIds },
        },
        _count: {
          followingId: true,
        },
      })

      followerCountMap = new Map(
        followerCounts.map((fc) => [fc.followingId, fc._count.followingId])
      )
    }
  } catch (error) {
    // Follow table might not exist yet
    console.warn("Could not fetch follower counts:", error)
  }

  // Add follower counts to users
  return users.map((user) => ({
    ...user,
    _count: {
      ...user._count,
      followers: followerCountMap.get(user.id) || 0,
      following: 0, // We can add this later if needed
    },
  }))

  return users
}

