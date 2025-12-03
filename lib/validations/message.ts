import { z } from "zod"

// Create message schema
export const createMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
})

// Mark message as read schema
export const markMessageReadSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
})

// Create or get conversation schema
export const getOrCreateConversationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
})

