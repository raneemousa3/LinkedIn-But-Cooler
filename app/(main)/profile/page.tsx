import { getProfile, getPublicProfile } from "@/app/actions/profile"
import { getPostsByUser } from "@/app/actions/post"
import { getMoodBoards } from "@/app/actions/moodboard"
import { getUserServices } from "@/app/actions/service"
import { PublicProfile } from "@/components/features/public-profile"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { userId?: string; tab?: string }
}) {
  const session = await auth()
  
  // If userId is provided, show that user's profile (public view)
  if (searchParams.userId) {
    try {
      const profile = await getPublicProfile(searchParams.userId)
      const posts = await getPostsByUser(searchParams.userId)
      const services = await getUserServices(searchParams.userId)
      return (
        <PublicProfile
          profile={profile}
          posts={posts}
          services={services}
          isOwnProfile={session?.user?.id === searchParams.userId}
          initialTab={searchParams.tab || "profile"}
        />
      )
    } catch (error) {
      redirect("/profile")
    }
  }

  // Otherwise, show current user's own profile
  if (!session?.user?.id) {
    redirect("/login")
  }

  const profile = await getProfile()
  const posts = await getPostsByUser(session.user.id)
  const moodBoards = await getMoodBoards()
  const services = await getUserServices(session.user.id)

  return (
    <PublicProfile
      profile={profile}
      posts={posts}
      moodBoards={moodBoards}
      services={services}
      isOwnProfile={true}
      initialTab={searchParams.tab || "profile"}
    />
  )
}
