"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createJobSchema, jobTypeSchema } from "@/lib/validations/job"
import { createJob } from "@/app/actions/job"

export function CreateJobForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      location: "",
      type: "Freelance",
      compensation: "",
      applicationUrl: "",
    },
  })

  const onSubmit = async (data: unknown) => {
    setError(null)

    startTransition(async () => {
      try {
        await createJob(data)
        reset()
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create job listing")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">Post a Job</h2>

      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Job Title *
          </label>
          <input
            id="title"
            {...register("title")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
            placeholder="e.g., Graphic Designer"
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            Job Type *
          </label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Freelance">Freelance</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description *
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={6}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
          placeholder="Describe the role, requirements, and what you're looking for..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            Company/Organization
          </label>
          <input
            id="company"
            {...register("company")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
            placeholder="Company name or 'Freelance'"
          />
          {errors.company && (
            <p className="mt-1 text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location
          </label>
          <input
            id="location"
            {...register("location")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
            placeholder="e.g., Remote, New York, London"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="compensation" className="block text-sm font-medium mb-2">
            Compensation
          </label>
          <input
            id="compensation"
            {...register("compensation")}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
            placeholder="e.g., $50-75/hour, $60k-80k/year"
          />
          {errors.compensation && (
            <p className="mt-1 text-sm text-destructive">{errors.compensation.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="applicationUrl" className="block text-sm font-medium mb-2">
            Application URL
          </label>
          <input
            id="applicationUrl"
            {...register("applicationUrl")}
            type="url"
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
            placeholder="https://example.com/apply"
          />
          {errors.applicationUrl && (
            <p className="mt-1 text-sm text-destructive">{errors.applicationUrl.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post Job"}
      </button>
    </form>
  )
}

