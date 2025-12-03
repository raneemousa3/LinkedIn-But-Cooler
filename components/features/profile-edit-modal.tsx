"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { X } from "lucide-react"
import { profileUpdateSchema } from "@/lib/validations/profile"
import { updateProfile, createPortfolioItem, deletePortfolioItem } from "@/app/actions/profile"
import type { User, PortfolioItem } from "@prisma/client"
import { PortfolioItemForm } from "./portfolio-item-form"
import { PortfolioGrid } from "./portfolio-grid"

type ProfileWithPortfolio = User & {
  portfolioItems: PortfolioItem[]
}

interface ProfileEditModalProps {
  profile: ProfileWithPortfolio
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProfileEditModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
}: ProfileEditModalProps) {
  const [isPending, startTransition] = useTransition()
  const [portfolioItems, setPortfolioItems] = useState(profile.portfolioItems)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: profile.name ?? "",
      bio: profile.bio ?? "",
      image: profile.image ?? "",
      skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
      tools: Array.isArray(profile.tools) ? profile.tools.join(", ") : "",
    },
  })

  const [uploading, setUploading] = useState(false)
  const imageUrl = watch("image") || profile.image

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
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await response.json()
      setValue("image", data.url)
      setSuccess("Image uploaded successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: unknown) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        await updateProfile(data)
        setSuccess("Profile updated successfully!")
        setTimeout(() => {
          onSuccess()
          if (typeof window !== "undefined") {
            window.location.reload()
          }
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile")
      }
    })
  }

  const handleAddPortfolioItem = async (data: unknown) => {
    setError(null)
    try {
      const newItem = await createPortfolioItem(data)
      setPortfolioItems([...portfolioItems, newItem])
      setSuccess("Portfolio item added!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add portfolio item")
    }
  }

  const handleDeletePortfolioItem = async (id: string) => {
    setError(null)
    try {
      await deletePortfolioItem({ id })
      setPortfolioItems(portfolioItems.filter((item) => item.id !== id))
      setSuccess("Portfolio item deleted!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete portfolio item")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-background rounded-lg border shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-500/15 text-green-700 dark:text-green-400 px-4 py-2 text-sm">
                {success}
              </div>
            )}

            {/* Profile Picture Section */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Profile Picture
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full w-20 h-20 object-cover border-2 border-input"
                      unoptimized={imageUrl.startsWith("data:")}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-input">
                      <span className="text-2xl font-semibold text-muted-foreground">
                        {profile.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {/* File Upload */}
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-center cursor-pointer hover:bg-accent transition-colors"
                    >
                      {uploading ? "Uploading..." : "Upload from computer"}
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </div>
                  {/* URL Input */}
                  <div>
                    <input
                      id="image"
                      {...register("image")}
                      type="url"
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Or enter image URL"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload an image or enter a URL
                    </p>
                    {errors.image && (
                      <p className="mt-1 text-sm text-destructive">{errors.image.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Name *
              </label>
              <input
                id="name"
                {...register("name")}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Bio Section */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tell us about yourself, your profession, and years of experience..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Tip: Include your profession and years of experience (e.g., "Photographer 10 years")
              </p>
              {errors.bio && (
                <p className="mt-1 text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            {/* Skills Section */}
            <div>
              <label htmlFor="skills" className="block text-sm font-semibold mb-2">
                Skills
              </label>
              <input
                id="skills"
                {...register("skills", {
                  setValueAs: (value: string | string[]) => {
                    if (Array.isArray(value)) return value
                    if (typeof value !== "string") return []
                    return value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                  },
                })}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Design, Photography, Illustration"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className="mt-1 text-sm text-destructive">{errors.skills.message}</p>
              )}
            </div>

            {/* Tools Section */}
            <div>
              <label htmlFor="tools" className="block text-sm font-semibold mb-2">
                Tools
              </label>
              <input
                id="tools"
                {...register("tools", {
                  setValueAs: (value: string | string[]) => {
                    if (Array.isArray(value)) return value
                    if (typeof value !== "string") return []
                    return value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                  },
                })}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Photoshop, Figma, Procreate"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate multiple tools with commas
              </p>
              {errors.tools && (
                <p className="mt-1 text-sm text-destructive">{errors.tools.message}</p>
              )}
            </div>

            {/* Portfolio Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
              <PortfolioItemForm onSubmit={handleAddPortfolioItem} />
              <div className="mt-4">
                <PortfolioGrid
                  items={portfolioItems}
                  onDelete={handleDeletePortfolioItem}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

