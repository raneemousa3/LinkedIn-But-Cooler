"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"

/**
 * Seed posts with downloaded images from mock-images folder
 */
export async function seedDownloadedImages() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const downloadedImages = [
    "downloaded_image.jpeg",
    "downloaded_image (1).jpeg",
    "downloaded_image (2).jpeg",
    "downloaded_image (3).jpeg",
    "downloaded_image (4).jpeg",
    "downloaded_image (5).jpeg",
    "downloaded_image (6).jpeg",
    "downloaded_image (7).jpeg",
    "downloaded_image (8).jpeg",
    "downloaded_image (9).jpeg",
  ]

  const createdPosts = []

  for (const imageName of downloadedImages) {
    // Encode the image name for URL (handles special characters and spaces)
    const encodedImageName = encodeURIComponent(imageName)
    const imageUrl = `/mock-images/${encodedImageName}`

    // Check if post with this image already exists
    const existingPost = await prisma.post.findFirst({
      where: {
        imageUrl: imageUrl,
        authorId: session.user.id,
      },
    })

    if (!existingPost) {
      try {
        const post = await prisma.post.create({
          data: {
            content: null,
            imageUrl: imageUrl,
            authorId: session.user.id,
          },
        })
        createdPosts.push(post)
      } catch (error) {
        console.error(`Failed to create post for ${imageName}:`, error)
      }
    }
  }

  revalidatePath("/feed")
  return {
    success: true,
    created: createdPosts.length,
    total: downloadedImages.length,
  }
}

