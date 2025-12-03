import { NextRequest, NextResponse } from "next/server"
import { seedDownloadedImages } from "@/app/actions/seed-posts"

export async function POST(request: NextRequest) {
  try {
    const result = await seedDownloadedImages()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error seeding posts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed posts" },
      { status: 500 }
    )
  }
}

