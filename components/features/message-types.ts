// Provides shared message-related interfaces
import React from "react"

/**
 * Represents a single chat message in a conversation.
 */
export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: Date
  read: boolean
}

/**
 * Represents participant metadata for a conversation.
 */
export interface ConversationParticipant {
  id: string
  name: string | null
  image: string | null
}

/**
 * Represents a full conversation with participants and messages.
 */
export interface ConversationDetail {
  id: string
  participants: ConversationParticipant[]
  messages: ConversationMessage[]
  unreadCount: number
  updatedAt: Date
}

/**
 * Hook signature placeholder for future messaging hooks.
 */
export type UseConversationHook = (
  conversationId: string
) => {
  data: ConversationDetail | null
  isLoading: boolean
  error: Error | null
}

// Explanation: Added shared messaging interfaces to keep MessageThread/Composer aligned; next wire these types into component props and hooks.

