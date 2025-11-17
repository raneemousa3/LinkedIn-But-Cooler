"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/feed" className="text-xl font-bold">
          LinkedIn But Cooler
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/feed" className="text-sm font-medium hover:underline">
            Feed
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:underline">
            Profile
          </Link>
          <Link href="/jobs" className="text-sm font-medium hover:underline">
            Jobs
          </Link>
          <Link href="/events" className="text-sm font-medium hover:underline">
            Events
          </Link>
          <Link href="/messages" className="text-sm font-medium hover:underline">
            Messages
          </Link>
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-sm font-medium hover:underline"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}



