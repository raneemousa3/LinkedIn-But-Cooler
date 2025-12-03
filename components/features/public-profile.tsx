"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, Pencil } from "lucide-react"
import type { User, PortfolioItem, Post } from "@prisma/client"
import { ProfileEditModal } from "./profile-edit-modal"
import { StartConversationButton } from "./start-conversation-button"
import { MoodBoardsGrid } from "./moodboards-grid"
import { CreateServiceForm } from "./create-service-form"
import { Plus } from "lucide-react"
type Service = {
  id: string
  title: string
  description: string
  priceRange: string
  category: string | null
  isActive: boolean
  providerId: string
  createdAt: Date
  updatedAt: Date
}

type ProfileWithPortfolio = User & {
  portfolioItems: PortfolioItem[]
  _count: {
    posts: number
  }
}

type PostWithAuthor = Post & {
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

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

interface PublicProfileProps {
  profile: ProfileWithPortfolio
  posts: PostWithAuthor[]
  moodBoards?: MoodBoardWithItems[]
  services?: Service[]
  isOwnProfile?: boolean
  initialTab?: "profile" | "posts" | "saved" | "services"
}

export function PublicProfile({
  profile,
  posts,
  moodBoards = [],
  services = [],
  isOwnProfile = false,
  initialTab = "profile",
}: PublicProfileProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "posts" | "saved" | "services">(initialTab)
  const [isCreatingService, setIsCreatingService] = useState(false)
  const username = profile.name?.toLowerCase().replace(/\s+/g, "") || "user"
  const nameParts = profile.name?.split(" ") || []
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : profile.name || "User"
  
  // Extract profession and years from bio or use defaults
  // Only extract if it's not already in skills to avoid duplication
  const bioText = profile.bio || ""
  const professionMatch = bioText.match(/(\w+)\s+(\d+)\s+years?/i)
  let profession: string | null = null
  let yearsExperience = ""
  
  if (professionMatch) {
    const extractedProfession = professionMatch[1].toLowerCase()
    const skillsLower = profile.skills.map(s => s.toLowerCase())
    
    // Only show profession if it's NOT already in skills
    if (!skillsLower.includes(extractedProfession)) {
      profession = professionMatch[1]
      yearsExperience = `${professionMatch[2]} years`
    } else {
      // If it's in skills, don't show it as profession - just show years if available
      yearsExperience = `${professionMatch[2]} years`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Menu and Edit Button */}
      <div className="flex justify-between items-center p-4">
        <div></div>
        <div className="flex items-center gap-3">
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <StartConversationButton userId={profile.id} userName={profile.name} />
          )}
          <button className="text-white hover:text-white/80">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 pb-6">
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "User"}
                width={120}
                height={120}
                className="rounded-full w-[120px] h-[120px] object-cover"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center">
                <span className="text-4xl font-semibold text-muted-foreground">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0 text-white">
            <p className="text-sm text-white/70 mb-1">@{username}</p>
            <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
            {(profession || yearsExperience) && (
              <p className="text-sm">
                {profession && `${profession} `}
                {yearsExperience && <span className="text-white/60">{yearsExperience}</span>}
              </p>
            )}
            {/* Message Button - More visible location */}
            {!isOwnProfile && (
              <div className="mt-3">
                <StartConversationButton userId={profile.id} userName={profile.name} />
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 text-white text-sm space-y-1">
            {profile.bio
              .split("\n")
              .filter(line => {
                const trimmed = line.trim()
                // Filter out placeholder text
                return trimmed && !trimmed.toLowerCase().includes("bio text help")
              })
              .map((line, idx) => (
                <p key={idx} className={idx > 0 ? "text-white/70" : ""}>
                  {line.trim()}
                </p>
              ))}
          </div>
        )}

        {/* Skills & Tools Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-muted border border-white/20 text-white text-sm"
            >
              {skill}
            </span>
          ))}
          {profile.tools.map((tool, idx) => (
            <span
              key={`tool-${idx}`}
              className="px-3 py-1 rounded-full bg-muted border border-white/20 text-white text-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-b">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "saved"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Library
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "services"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Services
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="px-4 pb-8">
          {/* Portfolio Grid */}
          {profile.portfolioItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {profile.portfolioItems.map((item, idx) => {
                const isLarge = idx < 2
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-lg overflow-hidden bg-muted ${
                      isLarge ? "aspect-square" : "aspect-[4/3]"
                    }`}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title || "Portfolio item"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground text-xs">No image</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {profile.portfolioItems.length === 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`relative rounded-lg overflow-hidden bg-muted ${
                    i <= 2 ? "aspect-square" : "aspect-[4/3]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="px-4 pb-8">
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mt-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.content || "Post"}
                      fill
                      className="object-cover group-hover:opacity-90 transition-opacity"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-xs text-center px-2 line-clamp-3">
                        {post.content || "Text post"}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No posts yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="px-4 pb-8">
          {isOwnProfile ? (
            <MoodBoardsGrid moodBoards={moodBoards} isOwnProfile={true} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>This user's saved library is private.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "services" && (
        <div className="px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Services Offered</h2>
            {isOwnProfile && (
              <button
                onClick={() => setIsCreatingService(!isCreatingService)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isCreatingService ? "Cancel" : "Add Service"}
              </button>
            )}
          </div>

          {isOwnProfile && isCreatingService && (
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <CreateServiceForm
                onSuccess={() => {
                  setIsCreatingService(false)
                }}
                onCancel={() => setIsCreatingService(false)}
              />
            </div>
          )}

          {services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      {service.category && (
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                          {service.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {service.priceRange}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  {!service.isActive && (
                    <span className="text-xs text-muted-foreground italic">
                      (Currently unavailable)
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No services offered yet.</p>
              {isOwnProfile && !isCreatingService && (
                <p className="text-sm mt-2">Click "Add Service" to get started!</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false)
            if (typeof window !== "undefined") {
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}

