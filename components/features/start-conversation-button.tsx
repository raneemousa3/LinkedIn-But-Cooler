"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { getOrCreateConversation } from "@/app/actions/message"

interface StartConversationButtonProps {
  userId: string
  userName?: string | null
}

/**
 * Button to start a new conversation with a user.
 * Creates conversation if it doesn't exist, then navigates to it.
 */
export function StartConversationButton({
  userId,
  userName,
}: StartConversationButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStartConversation = () => {
    startTransition(async () => {
      try {
        const conversation = await getOrCreateConversation({ userId })
        router.push(`/messages/${conversation.id}`)
      } catch (error) {
        console.error("Failed to start conversation:", error)
        alert("Failed to start conversation. Please try again.")
      }
    })
  }

  return (
    <button
      onClick={handleStartConversation}
      disabled={isPending}
      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg border-2 border-primary"
      style={{ minWidth: "120px" }}
    >
      <MessageCircle className="w-5 h-5" />
      {isPending ? "Starting..." : "Message"}
    </button>
  )
}

