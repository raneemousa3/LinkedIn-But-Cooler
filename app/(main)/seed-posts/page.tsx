"use client"

import { useState } from "react"
import { seedDownloadedImages } from "@/app/actions/seed-posts"
import { useRouter } from "next/navigation"

export default function SeedPostsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; created: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSeed = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const result = await seedDownloadedImages()
      setResult(result)
      // Refresh the feed after a short delay
      setTimeout(() => {
        router.push("/feed")
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed posts")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background border rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold">Add Downloaded Images to Feed</h1>
        <p className="text-sm text-muted-foreground">
          This will add all 10 images starting with "downloaded" from the mock-images folder to your feed.
        </p>

        {error && (
          <div className="rounded-md bg-destructive/15 text-destructive px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-md bg-primary/15 text-primary px-4 py-2 text-sm">
            Successfully added {result.created} out of {result.total} images to your feed!
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={isLoading}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding images..." : "Add Images to Feed"}
        </button>

        <button
          onClick={() => router.push("/feed")}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to Feed
        </button>
      </div>
    </div>
  )
}

