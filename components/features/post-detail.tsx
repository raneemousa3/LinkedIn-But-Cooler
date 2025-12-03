"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Bookmark } from "lucide-react"
import { toggleLike } from "@/app/actions/like"
import { toggleBookmark } from "@/app/actions/bookmark"
import { createComment } from "@/app/actions/comment"
import { SaveToMoodBoardButton } from "./save-to-moodboard-button"
import type { Post, User, Comment } from "@prisma/client"

type PostWithAuthor = Post & {
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

type CommentWithUser = Comment & {
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface PostDetailProps {
  post: PostWithAuthor
  initialLikeStatus: { isLiked: boolean; count: number }
  initialComments: CommentWithUser[]
  initialBookmarkStatus: { isBookmarked: boolean }
}

/**
 * Single post detail view component.
 * Displays full post with like, comment, and bookmark functionality.
 */
export function PostDetail({
  post,
  initialLikeStatus,
  initialComments,
  initialBookmarkStatus,
}: PostDetailProps) {
  const [isLiked, setIsLiked] = useState(initialLikeStatus.isLiked)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkStatus.isBookmarked)
  const [likesCount, setLikesCount] = useState(initialLikeStatus.count)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState("")
  const [isPending, startTransition] = useTransition()

  const username = post.author.name?.toLowerCase().replace(/\s+/g, "") || "user"

  const handleLike = () => {
    startTransition(async () => {
      try {
        await toggleLike(post.id)
        setIsLiked(!isLiked)
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
      } catch (error) {
        console.error("Failed to toggle like:", error)
      }
    })
  }

  const handleBookmark = () => {
    startTransition(async () => {
      try {
        await toggleBookmark(post.id)
        setIsBookmarked(!isBookmarked)
      } catch (error) {
        console.error("Failed to toggle bookmark:", error)
      }
    })
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    startTransition(async () => {
      try {
        const newComment = await createComment({
          postId: post.id,
          content: commentText.trim(),
        })
        setComments([...comments, newComment])
        setCommentText("")
      } catch (error) {
        console.error("Failed to create comment:", error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/feed"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Link
              href={`/profile?userId=${post.author.id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="font-medium">@{username}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative w-full aspect-square bg-muted">
          <Image
            src={post.imageUrl}
            alt={post.content || "Post image"}
            fill
            className="object-contain"
            priority
          />
        </div>
      )}

      {/* Interaction Icons */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 transition-colors disabled:opacity-50 ${
              isLiked ? "text-red-500" : "text-foreground hover:text-red-500"
            }`}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 text-foreground">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{comments.length}</span>
          </div>

          <button
            onClick={handleBookmark}
            disabled={isPending}
            className={`transition-colors disabled:opacity-50 ${
              isBookmarked
                ? "text-primary"
                : "text-foreground hover:text-primary"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark
              className={`w-6 h-6 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>

          <SaveToMoodBoardButton postId={post.id} postImageUrl={post.imageUrl} />
        </div>
      </div>

      {/* Caption */}
      {post.content && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-start gap-3">
            <Link
              href={`/profile?userId=${post.author.id}`}
              className="font-semibold hover:underline flex-shrink-0"
            >
              @{username}
            </Link>
            <p className="flex-1 text-sm whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="px-4 py-4 border-b">
        {comments.length > 0 && (
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h3>
        )}

        {/* Comments List */}
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const commentUsername =
                comment.user.name?.toLowerCase().replace(/\s+/g, "") || "user"
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  {comment.user.image && (
                    <Link href={`/profile?userId=${comment.user.id}`}>
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile?userId=${comment.user.id}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        @{commentUsername}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No comments yet.</p>
              <p className="text-xs mt-1">Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="pt-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-0 bg-transparent px-0 py-2 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isPending}
              className="px-4 py-2 text-primary text-sm font-semibold hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {isPending ? "..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

