import { getPosts } from "@/app/actions/post"
import { CreatePostForm } from "@/components/features/create-post-form"
import { FeedPosts } from "@/components/features/feed-posts"

export default async function FeedPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feed</h1>
        <p className="text-muted-foreground">
          Share your creative work with the community
        </p>
      </div>

      <CreatePostForm />

      <FeedPosts initialPosts={posts} />
    </div>
  )
}
