import { getProfile } from "@/app/actions/profile"
import { ProfileEditForm } from "@/components/features/profile-edit-form"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const profile = await getProfile()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your profile information and portfolio
        </p>
      </div>

      <ProfileEditForm initialData={profile} />
    </div>
  )
}
