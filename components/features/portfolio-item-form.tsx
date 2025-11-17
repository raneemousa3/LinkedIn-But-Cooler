"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPortfolioItemSchema } from "@/lib/validations/profile"

interface PortfolioItemFormProps {
  onSubmit: (data: unknown) => Promise<void>
}

export function PortfolioItemForm({ onSubmit }: PortfolioItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPortfolioItemSchema),
    defaultValues: {
      imageUrl: "",
      title: "",
      description: "",
    },
  })

  const onFormSubmit = async (data: unknown) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(data)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add portfolio item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium">Add Portfolio Item</h3>

      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
          Image URL *
        </label>
        <input
          id="imageUrl"
          {...register("imageUrl")}
          type="url"
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="https://example.com/image.jpg"
          required
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title (optional)
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="Project title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="Brief description of the project..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add to Portfolio"}
      </button>
    </form>
  )
}


