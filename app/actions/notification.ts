"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"

/**
 * Create a notification
 */
export async function createNotification(data: {
  type: "like" | "comment" | "connect" | "insight"
  recipientId: string
  senderId?: string
  postId?: string
  metadata?: string
}) {
  try {
    // Don't create notification if sender is the recipient
    if (data.senderId && data.senderId === data.recipientId) {
      return null
    }

    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        recipientId: data.recipientId,
        senderId: data.senderId ?? null,
        postId: data.postId ?? null,
        metadata: data.metadata ?? null,
      },
    })

    revalidatePath("/notifications")
    return notification
  } catch (error: any) {
    // Check if Notification table doesn't exist
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      console.warn("Notification model not available.")
      return null
    }
    console.error("Error creating notification:", error)
    throw error
  }
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(limit: number = 50) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: session.user.id },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return notifications
  } catch (error: any) {
    // Notification table might not exist yet
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      console.warn("Notification model not available. Returning empty array.")
      return []
    }
    console.error("Error fetching notifications:", error)
    throw error
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  const session = await auth()
  if (!session?.user?.id) {
    return 0
  }

  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: session.user.id,
        read: false,
      },
    })

    return count
  } catch (error: any) {
    // Notification table might not exist yet
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      return 0
    }
    console.error("Error fetching unread count:", error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification || notification.recipientId !== session.user.id) {
      throw new Error("Notification not found or unauthorized")
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error: any) {
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      throw new Error("Notification tables do not exist. Please run the database migration.")
    }
    console.error("Error marking notification as read:", error)
    throw error
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error: any) {
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      throw new Error("Notification tables do not exist. Please run the database migration.")
    }
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

