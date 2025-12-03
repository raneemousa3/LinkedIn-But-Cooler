import { getPeople } from "@/app/actions/people"
import { getFollowStatuses } from "@/app/actions/follow"
import { auth } from "@/lib/auth"
import { PeopleList } from "@/components/features/people-list"

export default async function PeoplePage() {
  const people = await getPeople()
  const session = await auth()

  // Get follow statuses for all people
  const userIds = people.map((person) => person.id)
  const followStatuses = session?.user?.id
    ? await getFollowStatuses(userIds)
    : {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover creatives in your network
          </p>
        </div>
      </div>

      {/* People Grid */}
      <div className="container mx-auto px-4 py-8">
        <PeopleList initialPeople={people} initialFollowStatuses={followStatuses} />
      </div>
    </div>
  )
}
