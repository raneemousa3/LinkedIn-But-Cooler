import Link from "next/link"
import { getPosts } from "@/app/actions/post"
import { getFollowStatuses } from "@/app/actions/follow"
import { auth } from "@/lib/auth"
import { PinterestFeed } from "@/components/features/pinterest-feed"
import { CreatePostButton } from "@/components/features/create-post-button"
import { User } from "lucide-react"
import Image from "next/image"

export default async function FeedPage() {
  // Fetch more posts to ensure we see all new ones
  const posts = await getPosts(100)
  const session = await auth()

  // Get follow statuses for all post authors
  const authorIds = [...new Set(posts.map((post) => post.author.id))]
  const followStatuses = session?.user?.id
    ? await getFollowStatuses(authorIds)
    : {}

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar with Profile Button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <Link
              href="/profile"
              className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted border border-border hover:opacity-80 transition-opacity"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </Link>
            
            {/* Search Input */}
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full border border-input bg-background px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8">
            <Link href="/feed" className="py-4 text-sm font-medium border-b-2 border-primary">
              posts
            </Link>
            <Link href="/jobs" className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
              jobs
            </Link>
            <Link href="/people" className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
              people
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Create Post Button */}
      <CreatePostButton />

      {/* Pinterest-style Feed */}
      <div className="container mx-auto px-4 py-8">
        <PinterestFeed initialPosts={posts} initialFollowStatuses={followStatuses} />
      </div>
    </div>
  )
}
