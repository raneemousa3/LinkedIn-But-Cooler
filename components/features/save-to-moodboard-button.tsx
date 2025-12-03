"use client"

import { useState, useTransition, useEffect } from "react"
import { Save } from "lucide-react"
import { getMoodBoards, createMoodBoard, addItemToMoodBoard, isPostSaved } from "@/app/actions/moodboard"
import { useSession } from "next-auth/react"

interface SaveToMoodBoardButtonProps {
  postId: string
  postImageUrl?: string | null
}

/**
 * Button to save a post to a mood board (Saved Library).
 * Shows modal to select existing mood board or create new one.
 */
export function SaveToMoodBoardButton({
  postId,
  postImageUrl,
}: SaveToMoodBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [moodBoards, setMoodBoards] = useState<Array<{ id: string; title: string; _count: { items: number } }>>([])
  const [isSaved, setIsSaved] = useState(false)
  const [savedMoodBoardIds, setSavedMoodBoardIds] = useState<string[]>([])
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [isPending, startTransition] = useTransition()
  const { data: session } = useSession()

  useEffect(() => {
    if (isOpen && session) {
      loadMoodBoards()
      checkIfSaved()
    }
  }, [isOpen, session, postId])

  const loadMoodBoards = async () => {
    try {
      const boards = await getMoodBoards()
      setMoodBoards(boards as any)
    } catch (error) {
      console.error("Failed to load mood boards:", error)
    }
  }

  const checkIfSaved = async () => {
    try {
      const result = await isPostSaved(postId)
      setIsSaved(result.isSaved)
      setSavedMoodBoardIds(result.moodBoardIds)
    } catch (error) {
      console.error("Failed to check if saved:", error)
    }
  }

  const handleSaveToBoard = async (moodBoardId: string) => {
    startTransition(async () => {
      try {
        await addItemToMoodBoard({
          moodBoardId,
          postId,
          imageUrl: postImageUrl ?? undefined,
        })
        setIsSaved(true)
        setSavedMoodBoardIds([...savedMoodBoardIds, moodBoardId])
        setIsOpen(false)
      } catch (error) {
        console.error("Failed to save to mood board:", error)
        alert("Failed to save. Please try again.")
      }
    })
  }

  const handleCreateAndSave = async () => {
    if (!newBoardTitle.trim()) return

    startTransition(async () => {
      try {
        const newBoard = await createMoodBoard({
          title: newBoardTitle.trim(),
          isPublic: false,
        })
        await addItemToMoodBoard({
          moodBoardId: newBoard.id,
          postId,
          imageUrl: postImageUrl ?? undefined,
        })
        setNewBoardTitle("")
        setIsSaved(true)
        setSavedMoodBoardIds([...savedMoodBoardIds, newBoard.id])
        await loadMoodBoards()
        setIsOpen(false)
      } catch (error) {
        console.error("Failed to create mood board:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to create mood board. Please try again."
        
        // Show detailed error message
        if (errorMessage.includes("migration") || errorMessage.includes("not found") || errorMessage.includes("Unknown model")) {
          alert("Database tables not found. Please run the SQL migration in Supabase first.\n\n1. Open Supabase SQL Editor\n2. Copy contents from supabase-migration.sql\n3. Run the migration\n\nError details: " + errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`transition-colors disabled:opacity-50 ${
          isSaved
            ? "text-primary"
            : "text-foreground hover:text-primary"
        }`}
        aria-label={isSaved ? "Saved" : "Save to moodboard"}
      >
        <Save className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md mx-4 bg-background rounded-lg border shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Save to Moodboard</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>

              {/* Create New Moodboard */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-semibold mb-2">Create New Moodboard</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Moodboard name..."
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={isPending}
                  />
                  <button
                    onClick={handleCreateAndSave}
                    disabled={!newBoardTitle.trim() || isPending}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? "..." : "Create & Save"}
                  </button>
                </div>
              </div>

              {/* Existing Moodboards */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Select a Moodboard</h3>
                {moodBoards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No moodboards yet. Create one above!</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {moodBoards.map((board) => {
                      const isAlreadySaved = savedMoodBoardIds.includes(board.id)
                      return (
                        <button
                          key={board.id}
                          onClick={() => !isAlreadySaved && handleSaveToBoard(board.id)}
                          disabled={isAlreadySaved || isPending}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            isAlreadySaved
                              ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-60"
                              : "bg-background border-input hover:border-primary hover:bg-primary/5 hover:shadow-sm cursor-pointer"
                          } disabled:opacity-50`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-semibold block">{board.title}</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {board._count.items} {board._count.items === 1 ? "item" : "items"}
                              </span>
                            </div>
                            {isAlreadySaved && (
                              <span className="text-xs text-primary font-medium ml-2">
                                ✓ Saved
                              </span>
                            )}
                            {!isAlreadySaved && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Click to save
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

