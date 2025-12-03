"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { createPortfolioItemSchema } from "@/lib/validations/profile"
import { compressImage } from "@/lib/image-compression"

interface PortfolioItemFormProps {
  onSubmit: (data: unknown) => Promise<void>
}

export function PortfolioItemForm({ onSubmit }: PortfolioItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPortfolioItemSchema),
    defaultValues: {
      imageUrl: "",
      title: "",
      description: "",
    },
  })

  const imageUrl = watch("imageUrl")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Compress image before uploading to reduce base64 size
      // Use more aggressive compression: 1280x1280, 75% quality
      const compressedFile = await compressImage(file, 1280, 1280, 0.75)

      const formData = new FormData()
      formData.append("file", compressedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await response.json()
      
      // Check if base64 data URL is too large (>400KB base64 = ~300KB binary)
      if (data.url && data.url.length > 300 * 1024) {
        throw new Error("Image is still too large after compression. Please use a smaller image file.")
      }
      
      setValue("imageUrl", data.url)
      setPreviewUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  // Update preview when URL changes
  const currentImage = previewUrl || imageUrl

  const onFormSubmit = async (data: unknown) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(data)
      reset()
      setPreviewUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add portfolio item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium">Create Portfolio Post</h3>

      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Photo *
        </label>
        <div className="space-y-3">
          {/* Image Preview */}
          {currentImage && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-input bg-muted">
              <Image
                src={currentImage}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={currentImage.startsWith("data:")}
              />
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label
              htmlFor="file-upload-portfolio"
              className="block w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-center cursor-pointer hover:bg-accent transition-colors"
            >
              {uploading ? "Uploading..." : currentImage ? "Change Photo" : "Upload Photo"}
            </label>
            <input
              id="file-upload-portfolio"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>

          {/* URL Input (Alternative) */}
          <div>
            <input
              id="imageUrl"
              {...register("imageUrl")}
              type="url"
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Or paste image URL"
              onChange={(e) => {
                setValue("imageUrl", e.target.value)
                setPreviewUrl(null)
              }}
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Caption Section (Instagram-style) */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Caption
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Write a caption..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {watch("description")?.length || 0} / 500 characters
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Link Section (Optional) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Link (optional)
        </label>
        <input
          id="title"
          {...register("title")}
          type="url"
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="https://example.com/project"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Add a link to your project or website
        </p>
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading || !currentImage}
        className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding..." : "Add to Portfolio"}
      </button>
    </form>
  )
}
