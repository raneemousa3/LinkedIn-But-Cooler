import { getEvents } from "@/app/actions/event"
import { EventsMap } from "@/components/features/events-map"
import { EventsList } from "@/components/features/events-list"

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Discover Nearby</h1>
        </div>
      </div>

      {/* Map Section - Top Third */}
      <div className="relative h-[33vh] bg-muted">
        <EventsMap events={events} />
        
        {/* Search Bar Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 z-20">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border border-input bg-background px-6 py-3 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Events List Section - Bottom Two Thirds */}
      <div className="bg-background min-h-[67vh]">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-6">Events</h2>
          <EventsList events={events} />
        </div>
      </div>
    </div>
  )
}
