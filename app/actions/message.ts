"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  createMessageSchema,
  markMessageReadSchema,
  getOrCreateConversationSchema,
} from "@/lib/validations/message"
import { revalidatePath } from "next/cache"

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // Safety check: if Conversation model doesn't exist yet, return empty array
  if (!prisma.conversation) {
    return []
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get the latest message
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: {
                  not: session.user.id,
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Format conversations to include the other user and unread count
    return conversations.map((conv) => {
      const otherUser = conv.user1Id === session.user.id ? conv.user2 : conv.user1
      const latestMessage = conv.messages[0] || null
      const unreadCount = conv._count.messages

      return {
        id: conv.id,
        otherUser,
        latestMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return []
  }
}

/**
 * Get or create a conversation between current user and another user
 */
export async function getOrCreateConversation(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = getOrCreateConversationSchema.parse(data)

  if (session.user.id === validated.userId) {
    throw new Error("Cannot create conversation with yourself")
  }

  // Safety check
  if (!prisma.conversation) {
    throw new Error("Conversation model not available")
  }

  // Find existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: session.user.id, user2Id: validated.userId },
        { user1Id: validated.userId, user2Id: session.user.id },
      ],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  if (existing) {
    return existing
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      user1Id: session.user.id,
      user2Id: validated.userId,
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/messages")
  return conversation
}

/**
 * Create a new message
 */
export async function createMessage(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createMessageSchema.parse(data)

  // Safety check
  if (!prisma.message || !prisma.conversation) {
    throw new Error("Message model not available")
  }

  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: validated.conversationId },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  if (conversation.user1Id !== session.user.id && conversation.user2Id !== session.user.id) {
    throw new Error("Unauthorized")
  }

  const message = await prisma.message.create({
    data: {
      conversationId: validated.conversationId,
      senderId: session.user.id,
      content: validated.content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  // Update conversation's updatedAt
  await prisma.conversation.update({
    where: { id: validated.conversationId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/messages")
  return message
}

/**
 * Get a single conversation with all messages
 */
export async function getConversation(conversationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Safety check
  if (!prisma.conversation) {
    throw new Error("Conversation model not available")
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  // Verify user is part of the conversation
  if (
    conversation.user1Id !== session.user.id &&
    conversation.user2Id !== session.user.id
  ) {
    throw new Error("Unauthorized")
  }

  // Mark messages as read
  await markMessagesAsRead(conversationId)

  return conversation
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Safety check
  if (!prisma.message) {
    return { success: true }
  }

  try {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: session.user.id,
        },
        read: false,
      },
      data: {
        read: true,
      },
    })

    revalidatePath("/messages")
    revalidatePath(`/messages/${conversationId}`)
    return { success: true }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return { success: false }
  }
}

