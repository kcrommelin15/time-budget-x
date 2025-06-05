"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        await supabase.auth.getSession()
        // Redirect to the home page
        router.push("/")
      } catch (error) {
        console.error("Error handling auth callback:", error)
        router.push("/?error=auth_callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <h2 className="mb-2 text-xl font-semibold">Completing sign in...</h2>
        <p>Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
