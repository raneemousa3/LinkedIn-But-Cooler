"use client"

import { useMemo } from "react"
import type { Event, User } from "@prisma/client"

type EventWithOrganizer = Event & {
  organizer: Pick<User, "id" | "name" | "image">
}

interface EventsMapProps {
  events: EventWithOrganizer[]
}

export function EventsMap({ events }: EventsMapProps) {
  // Simple SVG map representation
  const mapSvg = useMemo(() => {
    return (
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Background */}
        <rect width="400" height="300" fill="#e5e7eb" />
        
        {/* Grid lines (streets) */}
        <g stroke="#d1d5db" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i + 1) * 37.5}
              x2={400}
              y2={(i + 1) * 37.5}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 40}
              y1={0}
              x2={(i + 1) * 40}
              y2={300}
            />
          ))}
        </g>
        
        {/* River */}
        <path
          d="M 50 50 Q 150 100, 200 80 T 350 100"
          stroke="#60a5fa"
          strokeWidth="8"
          fill="none"
          opacity="0.6"
        />
        
        {/* Parks (green areas) */}
        <rect x="80" y="150" width="60" height="40" fill="#86efac" opacity="0.5" rx="4" />
        <rect x="250" y="200" width="80" height="50" fill="#86efac" opacity="0.5" rx="4" />
        <rect x="300" y="50" width="50" height="60" fill="#86efac" opacity="0.5" rx="4" />
        
        {/* Event markers */}
        {events.slice(0, 5).map((event, index) => {
          const x = 80 + (index * 60) + (index % 2) * 20
          const y = 100 + (index % 3) * 50
          return (
            <circle
              key={event.id}
              cx={x}
              cy={y}
              r="6"
              fill="#ef4444"
              className="cursor-pointer hover:fill-red-600"
            />
          )
        })}
      </svg>
    )
  }, [events])

  return (
    <div className="w-full h-full relative">
      {mapSvg}
    </div>
  )
}

