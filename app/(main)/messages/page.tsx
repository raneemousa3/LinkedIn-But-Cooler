import { getConversations } from "@/app/actions/message"
import { MessagesList } from "@/components/features/messages-list"
import Link from "next/link"

export default async function MessagesPage() {
  const conversations = await getConversations()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Link
              href="/people"
              className="text-sm font-medium text-primary hover:underline"
            >
              Find People
            </Link>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="container mx-auto px-4 py-4">
        <MessagesList initialConversations={conversations} />
      </div>
    </div>
  )
}
