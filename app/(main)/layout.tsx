import { Navbar } from "@/components/features/navbar"
import { BottomNav } from "@/components/features/bottom-nav"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}


