"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import AuthModal from "./auth-modal"

export default function LoginButton() {
  const { user, loading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  if (loading) {
    return <Button variant="outline">Loading...</Button>
  }

  if (user) {
    return (
      <Button variant="outline" onClick={() => setIsAuthModalOpen(true)}>
        {user.email || "Account"}
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
