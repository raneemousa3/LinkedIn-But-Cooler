"use client"

import { useState } from "react"
import Image from "next/image"
import type { PortfolioItem } from "@prisma/client"

interface PortfolioGridProps {
  items: PortfolioItem[]
  onDelete: (id: string) => Promise<void>
}

export function PortfolioGrid({ items, onDelete }: PortfolioGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) {
      return
    }

    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeletingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No portfolio items yet. Add your first one above!</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Portfolio ({items.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-lg border overflow-hidden bg-background"
          >
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl}
                alt={item.title || "Portfolio item"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              {item.description && (
                <p className="text-sm text-foreground mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.title && (
                <a
                  href={item.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Project →
                </a>
              )}
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-xs font-medium hover:bg-destructive/90 disabled:opacity-50"
            >
              {deletingId === item.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

