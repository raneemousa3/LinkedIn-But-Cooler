"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deletePost, getPosts } from "@/app/actions/post"
import { followUser, unfollowUser, getFollowStatuses } from "@/app/actions/follow"
import { useSession } from "next-auth/react"
import type { Post, User } from "@prisma/client"

type PostWithAuthor = Post & {
  author: Pick<User, "id" | "name" | "image">
}

interface PinterestFeedProps {
  initialPosts: PostWithAuthor[]
  initialFollowStatuses?: Record<string, boolean>
}

export function PinterestFeed({ initialPosts, initialFollowStatuses = {} }: PinterestFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>(initialFollowStatuses)
  const [followingId, setFollowingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Refresh posts when component mounts or when visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        setIsRefreshing(true)
        try {
          const newPosts = await getPosts(100)
          setPosts(newPosts)
          router.refresh()
        } catch (error) {
          console.error("Failed to refresh posts:", error)
        } finally {
          setIsRefreshing(false)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [router])

  const refreshPosts = async () => {
    setIsRefreshing(true)
    try {
      // Force refresh by fetching new posts
      const newPosts = await getPosts(100)
      setPosts(newPosts)
      // Also refresh the router to update server-side data
      router.refresh()
    } catch (error) {
      console.error("Failed to refresh posts:", error)
      // Fallback: reload the page
      window.location.reload()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setDeletingId(id)
    try {
      await deletePost({ id })
      setPosts(posts.filter((post) => post.id !== id))
      // State updated, no need to refresh
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeletingId(null)
    }
  }

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
      // State updated, no need to refresh
    } catch (err) {
      console.error("Failed to follow/unfollow:", err)
    } finally {
      setFollowingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  // Filter posts with images for the grid
  const imagePosts = posts.filter((post) => post.imageUrl)
  const textOnlyPosts = posts.filter((post) => !post.imageUrl)

  const getUsername = (name: string | null | undefined) => {
    if (!name) return "anonymous"
    return name.toLowerCase().replace(/\s+/g, "")
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={refreshPosts}
          disabled={isRefreshing}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <span className="animate-spin">⟳</span>
              Refreshing...
            </>
          ) : (
            <>
              <span>⟳</span>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Pinterest-style masonry grid for image posts */}
      {imagePosts.length > 0 && (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
          {imagePosts.map((post) => {
            const isOwnPost = session?.user?.id === post.authorId
            const isFollowing = followStatuses[post.author.id] || false
            const username = getUsername(post.author.name)

            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group relative break-inside-avoid mb-4 rounded-lg overflow-hidden bg-background border border-border hover:border-primary/50 transition-all block cursor-pointer"
              >
                {/* Username and Follow button at top */}
                <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.author.image && (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || "User"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-white text-sm font-medium drop-shadow-lg">
                        @{username}
                      </span>
                    </div>
                    {!isOwnPost && session?.user?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollow(post.author.id)
                        }}
                        disabled={followingId === post.author.id}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          isFollowing
                            ? "bg-white text-black hover:bg-white/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        } disabled:opacity-50`}
                      >
                        {followingId === post.author.id
                          ? "..."
                          : isFollowing
                          ? "In touch"
                          : "Keep in touch"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Image */}
                {post.imageUrl && (
                  <div className="relative w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.content || "Post image"}
                      width={400}
                      height={600}
                      className="w-full h-auto object-cover"
                      unoptimized
                    />

                    {/* Delete button (only for own posts) */}
                    {isOwnPost && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(post.id)
                          }}
                          disabled={deletingId === post.id}
                          className="bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 disabled:opacity-50"
                          title="Delete post"
                        >
                          {deletingId === post.id ? "..." : "×"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Content preview below image (if exists) */}
                {post.content && (
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Text-only posts in a separate section */}
      {textOnlyPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Text Posts</h2>
          {textOnlyPosts.map((post) => {
            const isOwnPost = session?.user?.id === post.authorId
            const isFollowing = followStatuses[post.author.id] || false
            const username = getUsername(post.author.name)

            return (
              <div
                key={post.id}
                className="rounded-lg border bg-background p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
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
                      <p className="font-medium">@{username}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {!isOwnPost && session?.user?.id && (
                    <button
                      onClick={() => handleFollow(post.author.id)}
                      disabled={followingId === post.author.id}
                      className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                        isFollowing
                          ? "bg-primary/10 text-primary border border-primary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      } disabled:opacity-50`}
                    >
                      {followingId === post.author.id
                        ? "..."
                        : isFollowing
                        ? "In touch"
                        : "Keep in touch"}
                    </button>
                  )}
                </div>
                {post.content && (
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                )}
                {isOwnPost && (
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
            )
          })}
        </div>
      )}
    </div>
  )
}
