"use client"

import { useState } from "react"
import Image from "next/image"
import { deleteJob } from "@/app/actions/job"
import { useSession } from "next-auth/react"
import type { Job, User } from "@prisma/client"

type JobWithPoster = Job & {
  postedBy: Pick<User, "id" | "name" | "image">
  _count?: {
    applications: number
  }
}

interface JobListingsProps {
  initialJobs: JobWithPoster[]
}

export function JobListings({ initialJobs }: JobListingsProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job listing?")) {
      return
    }

    setDeletingId(id)
    try {
      await deleteJob({ id })
      setJobs(jobs.filter((job) => job.id !== id))
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeletingId(null)
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No job listings yet. Be the first to post an opportunity!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Available Opportunities</h2>
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border bg-background p-6 space-y-4 hover:border-primary/50 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {job.postedBy.image && (
                  <Image
                    src={job.postedBy.image}
                    alt={job.postedBy.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Posted by {job.postedBy.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
              {job.company && (
                <p className="text-sm text-muted-foreground">{job.company}</p>
              )}
            </div>
            {session?.user?.id === job.postedById && (
              <button
                onClick={() => handleDelete(job.id)}
                disabled={deletingId === job.id}
                className="text-sm text-destructive hover:underline disabled:opacity-50"
              >
                {deletingId === job.id ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              {job.type}
            </span>
            {job.location && (
              <span className="text-muted-foreground">📍 {job.location}</span>
            )}
            {job.compensation && (
              <span className="text-muted-foreground">💰 {job.compensation}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm whitespace-pre-wrap">{job.description}</p>

          {/* Application Section */}
          <div className="flex items-center justify-between">
            {job.applicationUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Details →
              </a>
            )}
            {job._count?.applications !== undefined && job._count.applications > 0 && (
              <span className="text-xs text-muted-foreground">
                {job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

