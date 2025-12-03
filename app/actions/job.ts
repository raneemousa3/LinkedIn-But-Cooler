"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "@/lib/validations/job"
import { revalidatePath } from "next/cache"

/**
 * Get all job listings (ordered by newest first)
 */
export async function getJobs(limit: number = 50) {
  const jobs = await prisma.job.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    // _count is a separate field, not part of include
  })

  // Get application counts separately if JobApplication model exists
  let applicationCounts: Record<string, number> = {}
  if (prisma.jobApplication && jobs.length > 0) {
    try {
      const jobIds = jobs.map((job) => job.id)
      const counts = await prisma.jobApplication.groupBy({
        by: ["jobId"],
        where: {
          jobId: { in: jobIds },
        },
        _count: {
          jobId: true,
        },
      })

      applicationCounts = counts.reduce((acc, item) => {
        acc[item.jobId] = item._count.jobId
        return acc
      }, {} as Record<string, number>)
    } catch (error) {
      // JobApplication table might not exist yet
      console.warn("Could not fetch application counts:", error)
    }
  }

  // Add application counts to jobs
  return jobs.map((job) => ({
    ...job,
    _count: {
      applications: applicationCounts[job.id] || 0,
    },
  }))
}

/**
 * Get a single job by ID
 */
export async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return job
}

/**
 * Create a new job listing
 */
export async function createJob(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createJobSchema.parse(data)

  const job = await prisma.job.create({
    data: {
      title: validated.title,
      description: validated.description,
      company: validated.company ?? null,
      location: validated.location ?? null,
      type: validated.type,
      compensation: validated.compensation ?? null,
      applicationUrl: validated.applicationUrl ?? null,
      postedById: session.user.id,
    },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/jobs")
  return job
}

/**
 * Update a job listing
 */
export async function updateJob(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = updateJobSchema.parse(data)

  // Verify the job belongs to the current user
  const existing = await prisma.job.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.postedById !== session.user.id) {
    throw new Error("Job not found or unauthorized")
  }

  const job = await prisma.job.update({
    where: { id: validated.id },
    data: {
      title: validated.title,
      description: validated.description,
      company: validated.company ?? null,
      location: validated.location ?? null,
      type: validated.type,
      compensation: validated.compensation ?? null,
      applicationUrl: validated.applicationUrl ?? null,
    },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/jobs")
  return job
}

/**
 * Delete a job listing
 */
export async function deleteJob(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = deleteJobSchema.parse(data)

  // Verify the job belongs to the current user
  const existing = await prisma.job.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.postedById !== session.user.id) {
    throw new Error("Job not found or unauthorized")
  }

  await prisma.job.delete({
    where: { id: validated.id },
  })

  revalidatePath("/jobs")
  return { success: true }
}

