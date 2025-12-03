"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { User } from "@prisma/client"

type MessagePreview = {
  id: string
  content: string
  sender: {
    id: string
    name: string | null
  }
  createdAt: Date
}

type ConversationItem = {
  id: string
  otherUser: {
    id: string
    name: string | null
    image: string | null
  }
  latestMessage: MessagePreview | null
  unreadCount: number
  updatedAt: Date
}

interface MessagesListProps {
  initialConversations: ConversationItem[]
}

export function MessagesList({ initialConversations }: MessagesListProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No messages yet. Start a conversation!</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {conversations.map((conversation) => {
        const isUnread = conversation.unreadCount > 0
        const displayName = conversation.otherUser.name || "Anonymous"
        const latestMessage = conversation.latestMessage
        const messagePreview = latestMessage?.content || ""
        const isMessageFromCurrentUser = latestMessage?.sender.id === session?.user?.id
        const messagePrefix = isMessageFromCurrentUser ? "You: " : ""

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`block p-4 transition-colors hover:bg-muted/50 border-b border-border ${
              isUnread
                ? "bg-muted"
                : "bg-background"
            }`}
          >
            <div className="flex items-start gap-3 relative">
              {/* Profile Picture */}
              {conversation.otherUser.image && (
                <Image
                  src={conversation.otherUser.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
              )}
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conversation.latestMessage && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.latestMessage.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {isUnread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                {latestMessage ? (
                  <div className="mt-1.5">
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      <span className={isMessageFromCurrentUser ? "font-medium text-foreground" : ""}>
                        {messagePrefix}
                      </span>
                      {messagePreview}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm mt-1.5 italic text-muted-foreground">
                    No messages yet
                  </p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

