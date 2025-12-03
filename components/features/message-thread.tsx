"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MessageComposer } from "./message-composer"
import type { Conversation, Message, User } from "@prisma/client"

type ConversationWithMessages = Conversation & {
  user1: {
    id: string
    name: string | null
    image: string | null
  }
  user2: {
    id: string
    name: string | null
    image: string | null
  }
  messages: (Message & {
    sender: {
      id: string
      name: string | null
      image: string | null
    }
  })[]
}

interface MessageThreadProps {
  conversation: ConversationWithMessages
  currentUserId: string
}

/**
 * MessageThread displays an individual conversation with full history
 * and provides controls for composing new messages.
 */
export function MessageThread({ conversation, currentUserId }: MessageThreadProps) {
  // Scroll to bottom on mount
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [conversation.messages])

  const otherUser =
    conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1

  const otherUserName = otherUser.name || "User"
  const otherUserImage = otherUser.image

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/messages"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            {otherUserImage && (
              <Image
                src={otherUserImage}
                alt={otherUserName}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <Link
              href={`/profile?userId=${otherUser.id}`}
              className="font-semibold hover:underline"
            >
              {otherUserName}
            </Link>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 container mx-auto px-4 py-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversation.messages.map((message) => {
            const isFromCurrentUser = message.sender.id === currentUserId

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isFromCurrentUser && message.sender.image && (
                  <Image
                    src={message.sender.image}
                    alt={message.sender.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isFromCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {isFromCurrentUser && message.sender.image && (
                  <Image
                    src={message.sender.image}
                    alt={message.sender.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Message Composer */}
      <div className="sticky bottom-0 border-t bg-background">
        <div className="container mx-auto px-4 py-4">
          <MessageComposer conversationId={conversation.id} />
        </div>
      </div>
    </div>
  )
}

