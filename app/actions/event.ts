"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
} from "@/lib/validations/event"
import { revalidatePath } from "next/cache"

/**
 * Get all events (ordered by start date)
 */
export async function getEvents(limit: number = 50) {
  // Safety check: if Event model doesn't exist yet, return empty array
  if (!prisma.event) {
    console.warn("Event model not available. Make sure to create the Event table and regenerate Prisma Client.")
    return []
  }

  try {
    const events = await prisma.event.findMany({
      take: limit,
      orderBy: { startDate: "asc" },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return events
  } catch (error) {
    console.error("Error fetching events:", error)
    // Return empty array if there's an error (e.g., table doesn't exist)
    return []
  }
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return event
}

/**
 * Create a new event
 */
export async function createEvent(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = createEventSchema.parse(data)

  const event = await prisma.event.create({
    data: {
      title: validated.title,
      description: validated.description,
      imageUrl: validated.imageUrl ?? null,
      location: validated.location,
      address: validated.address ?? null,
      latitude: validated.latitude ?? null,
      longitude: validated.longitude ?? null,
      startDate: validated.startDate instanceof Date ? validated.startDate : new Date(validated.startDate),
      endDate: validated.endDate ? (validated.endDate instanceof Date ? validated.endDate : new Date(validated.endDate)) : null,
      category: validated.category ?? null,
      organizerId: session.user.id,
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/events")
  return event
}

/**
 * Update an event
 */
export async function updateEvent(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = updateEventSchema.parse(data)

  // Verify the event belongs to the current user
  const existing = await prisma.event.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.organizerId !== session.user.id) {
    throw new Error("Event not found or unauthorized")
  }

  const event = await prisma.event.update({
    where: { id: validated.id },
    data: {
      title: validated.title,
      description: validated.description,
      imageUrl: validated.imageUrl ?? null,
      location: validated.location,
      address: validated.address ?? null,
      latitude: validated.latitude ?? null,
      longitude: validated.longitude ?? null,
      startDate: validated.startDate instanceof Date ? validated.startDate : new Date(validated.startDate),
      endDate: validated.endDate ? (validated.endDate instanceof Date ? validated.endDate : new Date(validated.endDate)) : null,
      category: validated.category ?? null,
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/events")
  return event
}

/**
 * Delete an event
 */
export async function deleteEvent(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validated = deleteEventSchema.parse(data)

  // Verify the event belongs to the current user
  const existing = await prisma.event.findUnique({
    where: { id: validated.id },
  })

  if (!existing || existing.organizerId !== session.user.id) {
    throw new Error("Event not found or unauthorized")
  }

  await prisma.event.delete({
    where: { id: validated.id },
  })

  revalidatePath("/events")
  return { success: true }
}

