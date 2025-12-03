"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPostSchema } from "@/lib/validations/post"
import { createPost } from "@/app/actions/post"

interface CreatePostFormProps {
  onSuccess?: () => void
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
    },
  })

  const onSubmit = async (data: unknown) => {
    setError(null)

    startTransition(async () => {
      try {
        await createPost(data)
        reset()
        onSuccess?.()
        // Refresh the router to show new post
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create post")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          What's on your mind?
        </label>
        <textarea
          id="content"
          {...register("content")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="Share your thoughts, projects, or inspiration..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
          Image URL (optional)
        </label>
        <input
          id="imageUrl"
          {...register("imageUrl")}
          type="url"
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post"}
      </button>
    </form>
  )
}


