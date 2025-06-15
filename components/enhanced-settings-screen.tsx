"use client"

import type React from "react"

import { useState } from "react"
import { LogOut } from "lucide-react"

import { useUser } from "@/context/user-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface SettingsScreenProps {
  onLogout: () => void
}

const EnhancedSettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const { user } = useUser()
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        setError(`Sign out error: ${error.message}`)
      } else {
        // Clear all local state
        onLogout()

        // Force a page reload to clear any cached OAuth state
        window.location.reload()
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account settings and set preferences.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="flex flex-col space-y-1.5">
            <h4 className="text-sm font-semibold">User Information</h4>
            <p className="text-sm text-muted-foreground">View and manage your user information.</p>
          </div>
          <div className="mt-4">
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.id}</p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full h-12 rounded-2xl border-red-300 text-red-600 hover:bg-red-50"
          disabled={isSigningOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>

        {error && (
          <div className="rounded-md border p-4 bg-red-100 border-red-400 text-red-700">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSettingsScreen
