"use client"

import { useState, useTransition } from "react"
import { createMessage } from "@/app/actions/message"
import { useRouter } from "next/navigation"

/**
 * Props for MessageComposer.
 */
export interface MessageComposerProps {
  conversationId: string
}

/**
 * MessageComposer renders the input surface used to compose a new message.
 */
export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isPending) return

    const messageText = message.trim()
    setMessage("")

    startTransition(async () => {
      try {
        await createMessage({
          conversationId,
          content: messageText,
        })
        router.refresh()
      } catch (error) {
        console.error("Failed to send message:", error)
        setMessage(messageText) // Restore message on error
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={!message.trim() || isPending}
        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "..." : "Send"}
      </button>
    </form>
  )
}

