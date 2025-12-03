import { getConversation } from "@/app/actions/message"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MessageThread } from "@/components/features/message-thread"

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  try {
    const conversation = await getConversation(params.conversationId)
    return <MessageThread conversation={conversation} currentUserId={session.user.id} />
  } catch (error) {
    console.error("Error fetching conversation:", error)
    redirect("/messages")
  }
}

