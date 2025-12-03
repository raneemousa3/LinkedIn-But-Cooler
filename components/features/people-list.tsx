"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { followUser, unfollowUser } from "@/app/actions/follow"
import { useSession } from "next-auth/react"
import { StartConversationButton } from "./start-conversation-button"

type UserWithCounts = {
  id: string
  name: string | null
  email: string | null
  image: string | null | null
  bio: string | null
  skills: string[]
  tools: string[]
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface PeopleListProps {
  initialPeople: UserWithCounts[]
  initialFollowStatuses: Record<string, boolean>
}

export function PeopleList({ initialPeople, initialFollowStatuses = {} }: PeopleListProps) {
  const [people, setPeople] = useState(initialPeople)
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>(initialFollowStatuses)
  const [followingId, setFollowingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFollow = async (userId: string) => {
    if (!session?.user?.id || userId === session.user.id || !mounted) return

    setFollowingId(userId)
    try {
      const isCurrentlyFollowing = followStatuses[userId]
      if (isCurrentlyFollowing) {
        await unfollowUser(userId)
        setFollowStatuses((prev) => ({ ...prev, [userId]: false }))
      } else {
        await followUser(userId)
        setFollowStatuses((prev) => ({ ...prev, [userId]: true }))
      }
      // State is already updated, no need to refresh
    } catch (err) {
      console.error("Failed to follow/unfollow:", err)
    } finally {
      setFollowingId(null)
    }
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPeople.map((person) => (
          <div
            key={person.id}
            className="rounded-lg border bg-background p-6 space-y-4"
          >
            <div className="animate-pulse">
              <div className="h-16 w-16 rounded-full bg-muted mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No people found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person) => {
        const isFollowing = followStatuses[person.id] || false
        const username = person.name?.toLowerCase().replace(/\s+/g, "") || "user"

        return (
          <div
            key={person.id}
            className="rounded-lg border bg-background p-6 space-y-4 hover:border-primary/50 transition-colors"
          >
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              {person.image ? (
                <Image
                  src={person.image}
                  alt={person.name || "User"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">
                    {person.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {person.name || "Anonymous"}
                </h3>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>

            {/* Bio */}
            {person.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {person.bio}
              </p>
            )}

            {/* Skills & Tools */}
            {(person.skills.length > 0 || person.tools.length > 0) && (
              <div className="space-y-2">
                {person.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {person.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                      {person.skills.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{person.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {person.tools.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {person.tools.slice(0, 3).map((tool, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                      {person.tools.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{person.tools.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
              <span>{person._count.posts} posts</span>
              <span>{person._count.followers} in touch</span>
            </div>

            {/* Action Buttons */}
            {session?.user?.id && session.user.id !== person.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleFollow(person.id)}
                  disabled={followingId === person.id}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isFollowing
                      ? "bg-primary/10 text-primary border border-primary hover:bg-primary/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } disabled:opacity-50`}
                >
                  {followingId === person.id
                    ? "..."
                    : isFollowing
                    ? "In touch"
                    : "Keep in touch"}
                </button>
                <div className="flex-shrink-0">
                  <StartConversationButton userId={person.id} userName={person.name} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

