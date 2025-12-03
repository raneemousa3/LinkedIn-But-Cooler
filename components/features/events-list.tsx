"use client"

import { useState } from "react"
import Image from "next/image"
import { deleteEvent } from "@/app/actions/event"
import { useSession } from "next-auth/react"
import type { Event, User } from "@prisma/client"

type EventWithOrganizer = Event & {
  organizer: Pick<User, "id" | "name" | "image">
}

interface EventsListProps {
  events: EventWithOrganizer[]
}

export function EventsList({ events: initialEvents }: EventsListProps) {
  const [events, setEvents] = useState(initialEvents)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }

    setDeletingId(id)
    try {
      await deleteEvent({ id })
      setEvents(events.filter((event) => event.id !== id))
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeletingId(null)
    }
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No events yet. Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isOwnEvent = session?.user?.id === event.organizerId
        const eventDate = new Date(event.startDate)
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        const formattedTime = eventDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })

        return (
          <div
            key={event.id}
            className="flex gap-4 rounded-lg border bg-background p-4 hover:border-primary/50 transition-colors"
          >
            {/* Event Image */}
            <div className="flex-shrink-0">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover w-24 h-24"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>📍 {event.location}</span>
                    <span>📅 {formattedDate}</span>
                    <span>🕐 {formattedTime}</span>
                    {event.category && <span>🏷️ {event.category}</span>}
                  </div>
                </div>
                {isOwnEvent && (
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="text-sm text-destructive hover:underline disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

