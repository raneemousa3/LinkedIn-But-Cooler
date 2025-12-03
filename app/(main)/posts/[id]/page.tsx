import { getPost } from "@/app/actions/post"
import { getLikeStatus } from "@/app/actions/like"
import { getComments } from "@/app/actions/comment"
import { getBookmarkStatus } from "@/app/actions/bookmark"
import { redirect } from "next/navigation"
import { PostDetail } from "@/components/features/post-detail"

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await getPost(params.id)

  if (!post) {
    redirect("/feed")
  }

  const [likeStatus, comments, bookmarkStatus] = await Promise.all([
    getLikeStatus(post.id),
    getComments(post.id),
    getBookmarkStatus(post.id),
  ])

  return (
    <PostDetail
      post={post}
      initialLikeStatus={likeStatus}
      initialComments={comments}
      initialBookmarkStatus={bookmarkStatus}
    />
  )
}

