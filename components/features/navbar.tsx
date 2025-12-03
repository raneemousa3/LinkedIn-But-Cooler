"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, Home, User, Briefcase, MapPin, MessageCircle, LogOut, LogIn } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menuItems = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/events", label: "Events", icon: MapPin },
    { href: "/messages", label: "Messages", icon: MessageCircle },
  ]

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">Ev</span>
            <span className="text-xl">ra</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="border-t border-border">
                {session ? (
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      signOut()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-accent transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}



