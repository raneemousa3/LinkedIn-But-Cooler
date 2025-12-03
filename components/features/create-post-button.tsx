"use client"

import { useState } from "react"
import { CreatePostForm } from "./create-post-form"
import { X } from "lucide-react"

export function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 rounded-full bg-primary text-primary-foreground p-4 shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
        aria-label="Create post"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl mx-4 bg-background rounded-lg border shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Create Post</h2>
              <CreatePostForm onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

