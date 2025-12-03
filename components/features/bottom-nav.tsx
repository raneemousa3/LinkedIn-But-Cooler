"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, MessageCircle, Bell, User } from "lucide-react"
import { getUnreadNotificationCount } from "@/app/actions/notification"

/**
 * Bottom navigation bar component with 5 main navigation icons.
 * Matches mobile-first design with circular icons.
 */
export function BottomNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread notification count
    getUnreadNotificationCount().then(setUnreadCount).catch(() => {})
    
    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      getUnreadNotificationCount().then(setUnreadCount).catch(() => {})
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const navItems: Array<{
    href: string
    icon: typeof Home
    label: string
    isActive: boolean
    badge?: number
  }> = [
    {
      href: "/feed",
      icon: Home,
      label: "Feed",
      isActive: pathname === "/feed" || pathname === "/",
    },
    {
      href: "/events",
      icon: MapPin,
      label: "Events",
      isActive: pathname === "/events",
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Messages",
      isActive: pathname?.startsWith("/messages"),
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      isActive: pathname === "/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      isActive: pathname?.startsWith("/profile"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
      <div className="container mx-auto">
        <div className="flex items-center justify-around px-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-0 flex-1 transition-colors relative ${
                      item.isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={item.label}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors relative ${
                        item.isActive
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
                  </Link>
                )
              })}
        </div>
      </div>
    </nav>
  )
}

