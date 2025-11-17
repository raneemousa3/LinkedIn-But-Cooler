"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileUpdateSchema } from "@/lib/validations/profile"
import { updateProfile, createPortfolioItem, deletePortfolioItem } from "@/app/actions/profile"
import type { User, PortfolioItem } from "@prisma/client"
import { PortfolioItemForm } from "./portfolio-item-form"
import { PortfolioGrid } from "./portfolio-grid"

type ProfileWithPortfolio = User & {
  portfolioItems: PortfolioItem[]
}

interface ProfileEditFormProps {
  initialData: ProfileWithPortfolio
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition()
  const [portfolioItems, setPortfolioItems] = useState(initialData.portfolioItems)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialData.name ?? "",
      bio: initialData.bio ?? "",
      skills: Array.isArray(initialData.skills) 
        ? initialData.skills.join(", ") 
        : "",
      tools: Array.isArray(initialData.tools) 
        ? initialData.tools.join(", ") 
        : "",
    },
  })

  const onSubmit = async (data: unknown) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        await updateProfile(data)
        setSuccess("Profile updated successfully!")
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

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

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

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              {...register("name")}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
              placeholder="Your name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              {...register("bio")}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-2">
              Skills (comma-separated)
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
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
              placeholder="e.g., Design, Photography, Illustration"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-destructive">{errors.skills.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="tools" className="block text-sm font-medium mb-2">
              Tools (comma-separated)
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
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
              placeholder="e.g., Photoshop, Figma, Procreate"
            />
            {errors.tools && (
              <p className="mt-1 text-sm text-destructive">{errors.tools.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Portfolio Section */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>

        <PortfolioItemForm onSubmit={handleAddPortfolioItem} />

        <PortfolioGrid
          items={portfolioItems}
          onDelete={handleDeletePortfolioItem}
        />
      </div>
    </div>
  )
}

