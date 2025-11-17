"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/feed"
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    await signIn("email", { 
      email,
      callbackUrl 
    })
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Sign in with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Sign in with Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


