"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createServiceSchema, serviceCategorySchema } from "@/lib/validations/service"
import { createService } from "@/app/actions/service"

interface CreateServiceFormProps {
  onSuccess: () => void
  onCancel?: () => void
}

export function CreateServiceForm({ onSuccess, onCancel }: CreateServiceFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      priceRange: "",
      category: "",
    },
  })

  const onSubmit = async (data: unknown) => {
    setError(null)

    startTransition(async () => {
      try {
        await createService(data)
        reset()
        onSuccess()
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create service")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold">Add New Service</h3>

      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Service Title *
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="e.g., Web Development"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description *
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Describe your service in detail..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priceRange" className="block text-sm font-medium mb-2">
            Price Range *
          </label>
          <input
            id="priceRange"
            {...register("priceRange")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., $100 - $1,000"
            required
          />
          {errors.priceRange && (
            <p className="mt-1 text-sm text-destructive">{errors.priceRange.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a category</option>
            {serviceCategorySchema.options.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Service"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

