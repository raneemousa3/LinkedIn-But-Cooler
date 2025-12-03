import { getNotifications } from "@/app/actions/notification"
import { NotificationsList } from "@/components/features/notifications-list"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const notifications = await getNotifications(100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="container mx-auto px-4 py-4">
        <NotificationsList initialNotifications={notifications} />
      </div>
    </div>
  )
}

