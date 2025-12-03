import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/prisma"
import { createPortfolioItemSchema } from "@/lib/validations/profile"
import { revalidatePath } from "next/cache"

/**
 * API route to create portfolio item (avoids HTTP 431 by using POST body)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createPortfolioItemSchema.parse(body)

    // Check if image URL is too large
    if (validated.imageUrl && validated.imageUrl.length > 300 * 1024) {
      return NextResponse.json(
        { error: "Image is too large. Please use a smaller image." },
        { status: 400 }
      )
    }

    // Get the highest order value for this user
    const maxOrder = await prisma.portfolioItem.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        imageUrl: validated.imageUrl,
        title: validated.title ?? null,
        description: validated.description ?? null,
        order: validated.order ?? (maxOrder?.order ?? 0) + 1,
        userId: session.user.id,
      },
    })

    revalidatePath("/profile")
    return NextResponse.json({ success: true, portfolioItem })
  } catch (error) {
    console.error("Portfolio item creation error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    )
  }
}

