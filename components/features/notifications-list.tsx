"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notification"
import { Check, Heart, MessageCircle, UserPlus, TrendingUp } from "lucide-react"
import type { User, Notification } from "@prisma/client"

type NotificationWithRelations = Notification & {
  sender: Pick<User, "id" | "name" | "image"> | null
  recipient: Pick<User, "id" | "name" | "image">
}

interface NotificationsListProps {
  initialNotifications: NotificationWithRelations[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      try {
        await markNotificationAsRead(notificationId)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    })
  }

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      try {
        await markAllNotificationsAsRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      } catch (error) {
        console.error("Failed to mark all as read:", error)
      }
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "connect":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "insight":
        return <TrendingUp className="w-5 h-5 text-purple-500" />
      default:
        return <div className="w-5 h-5 rounded-full bg-muted" />
    }
  }

  const getNotificationMessage = (notification: NotificationWithRelations) => {
    const senderName = notification.sender?.name || "Someone"
    
    switch (notification.type) {
      case "like":
        return `${senderName} liked your post`
      case "comment":
        return `${senderName} commented on your post`
      case "connect":
        return `${senderName} wants to keep in touch`
      case "insight":
        const metadata = notification.metadata ? JSON.parse(notification.metadata) : {}
        return `Your post got ${metadata.count || 0} impressions`
      default:
        return "New notification"
    }
  }

  const getNotificationLink = (notification: NotificationWithRelations) => {
    if (notification.postId) {
      return `/posts/${notification.postId}`
    }
    if (notification.senderId) {
      return `/profile?userId=${notification.senderId}`
    }
    return "/feed"
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey = "Older"
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday"
    } else {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      if (date > weekAgo) {
        groupKey = "This Week"
      }
    }

    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(notification)
    return acc
  }, {} as Record<string, NotificationWithRelations[]>)

  const unreadCount = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No notifications yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications by Date */}
      {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
        <div key={groupKey} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {groupKey}
          </h2>
          <div className="space-y-2">
            {groupNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`block rounded-lg border p-4 transition-colors hover:bg-accent ${
                  notification.read ? "border-border bg-background" : "border-primary/50 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notification.sender?.image ? (
                      <Image
                        src={notification.sender.image}
                        alt={notification.sender.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

