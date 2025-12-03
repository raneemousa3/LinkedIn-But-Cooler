"use client"

import { useState } from "react"
import Image from "next/image"
import { deletePost } from "@/app/actions/post"
import { useSession } from "next-auth/react"
import type { Post, User } from "@prisma/client"

type PostWithAuthor = Post & {
  author: Pick<User, "id" | "name" | "image">
}

interface FeedPostsProps {
  initialPosts: PostWithAuthor[]
}

export function FeedPosts({ initialPosts }: FeedPostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setDeletingId(id)
    try {
      await deletePost({ id })
      setPosts(posts.filter((post) => post.id !== id))
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeletingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border bg-background p-6 space-y-4"
        >
          {/* Author Info */}
          <div className="flex items-center gap-3">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{post.author.name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          )}

          {/* Post Image */}
          {post.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.content || "Post image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          {/* Delete Button (only for own posts) */}
          {session?.user?.id === post.authorId && (
            <div className="flex justify-end">
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
                className="text-sm text-destructive hover:underline disabled:opacity-50"
              >
                {deletingId === post.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

