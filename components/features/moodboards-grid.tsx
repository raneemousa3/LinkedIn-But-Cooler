"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Folder, MoreVertical } from "lucide-react"

type MoodBoardWithItems = {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    items: number
  }
  items: Array<{
    id: string
    imageUrl: string | null
    postId: string | null
  }>
}

interface MoodBoardsGridProps {
  moodBoards: MoodBoardWithItems[]
  isOwnProfile?: boolean
}

/**
 * Display moodboards in a grid layout
 */
export function MoodBoardsGrid({ moodBoards, isOwnProfile = false }: MoodBoardsGridProps) {
  if (moodBoards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No moodboards yet.</p>
        {isOwnProfile && (
          <p className="text-xs mt-2">Save posts to create your first moodboard!</p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {moodBoards.map((moodBoard) => {
        // Get preview images from items
        const previewImages = moodBoard.items
          .filter((item) => item.imageUrl)
          .slice(0, 4)
          .map((item) => item.imageUrl!)

        return (
          <Link
            key={moodBoard.id}
            href={`/moodboards/${moodBoard.id}`}
            className="group relative rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all"
          >
            {/* Preview Grid */}
            <div className="aspect-square grid grid-cols-2 gap-0.5 p-0.5 bg-background">
              {previewImages.length > 0 ? (
                previewImages.map((imageUrl, idx) => (
                  <div
                    key={idx}
                    className={`relative overflow-hidden ${
                      idx === 0 && previewImages.length === 1
                        ? "col-span-2 row-span-2"
                        : idx === 0 && previewImages.length === 2
                        ? "col-span-2"
                        : ""
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${moodBoard.title} preview ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 row-span-2 flex items-center justify-center bg-muted">
                  <Folder className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
              )}
              {/* Fill empty slots */}
              {previewImages.length < 4 &&
                Array.from({ length: 4 - previewImages.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="bg-muted flex items-center justify-center"
                  >
                    <Folder className="w-4 h-4 text-muted-foreground opacity-30" />
                  </div>
                ))}
            </div>

            {/* Overlay with title and count */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-semibold text-sm line-clamp-1">{moodBoard.title}</h3>
                <p className="text-xs text-white/80 mt-0.5">
                  {moodBoard._count.items} {moodBoard._count.items === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            {/* Title overlay (always visible on mobile) */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 md:bg-transparent">
              <h3 className="font-semibold text-xs text-white md:text-transparent line-clamp-1">
                {moodBoard.title}
              </h3>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

