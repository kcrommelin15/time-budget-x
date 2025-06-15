"use client"

import { useState, useEffect } from "react"
import BudgetScreen from "@/components/budget-screen"
import TimelineScreen from "@/components/timeline-screen"
import EnhancedInsightsScreen from "@/components/enhanced-insights-screen"
import EnhancedSettingsScreen from "@/components/enhanced-settings-screen"
import Navigation from "@/components/navigation"
import FloatingToggle from "@/components/floating-toggle"
import AuthModal from "@/components/auth-modal"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function TimeBudgetApp() {
  const [activeScreen, setActiveScreen] = useState<"budget" | "timeline" | "insights" | "settings">("budget")
  const [user, setUser] = useState<User | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Check for auth success/error in URL params
        const urlParams = new URLSearchParams(window.location.search)
        const authError = urlParams.get("auth_error")
        const authSuccess = urlParams.get("auth_success")
        const verificationError = urlParams.get("verification_error")
        const verificationSuccess = urlParams.get("verification_success")

        if (authError) {
          setAuthError(`Authentication failed: ${authError}`)
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname)
        }

        if (verificationError) {
          setAuthError(`Email verification failed: ${verificationError}`)
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname)
        }

        if (verificationSuccess) {
          setVerificationMessage("Email verified successfully! You're now signed in.")
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname)
          // Clear message after 5 seconds
          setTimeout(() => setVerificationMessage(null), 5000)
        }

        if (authSuccess) {
          console.log("Auth success detected in URL")
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname)
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setAuthError(`Session error: ${error.message}`)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setIsInitialLoad(false)

          // Only show auth modal on initial load if no user and no auth in progress
          if (!session?.user && !authSuccess && !verificationSuccess) {
            setShowAuthModal(true)
          }
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err)
        if (mounted) {
          setAuthError(`Auth check error: ${err instanceof Error ? err.message : String(err)}`)
          setIsInitialLoad(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
        setAuthError(null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        // Clear any error state
        setAuthError(null)
        setVerificationMessage(null)
        // Don't automatically show auth modal on sign out
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleAuth = (userData: User) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthError(null)
      setVerificationMessage(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Subtle gradient overlay for extra glossiness */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none"></div>

      {authError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{authError}</p>
          <button onClick={() => setAuthError(null)} className="absolute top-1 right-1 text-red-500">
            ×
          </button>
        </div>
      )}

      {verificationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <p>{verificationMessage}</p>
          <button onClick={() => setVerificationMessage(null)} className="absolute top-1 right-1 text-green-500">
            ×
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto min-h-screen relative z-10">
        {/* Desktop Layout - Single Page */}
        <div className="hidden lg:block min-h-screen">
          <div className="max-w-4xl mx-auto relative">
            {activeScreen === "budget" && <BudgetScreen isDesktop={true} />}
            {activeScreen === "timeline" && <TimelineScreen isDesktop={true} />}
            {activeScreen === "insights" && <EnhancedInsightsScreen />}
            {activeScreen === "settings" && (
              <EnhancedSettingsScreen user={user} onAuth={handleAuth} onLogout={handleLogout} />
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto bg-white/60 backdrop-blur-xl min-h-screen relative rounded-t-3xl mt-4 shadow-2xl border border-white/40 overflow-hidden">
          {activeScreen === "budget" && <BudgetScreen />}
          {activeScreen === "timeline" && <TimelineScreen />}
          {activeScreen === "insights" && <EnhancedInsightsScreen />}
          {activeScreen === "settings" && (
            <EnhancedSettingsScreen user={user} onAuth={handleAuth} onLogout={handleLogout} />
          )}
        </div>

        {/* Mobile Navigation - Fixed to viewport bottom */}
        <div className="lg:hidden">
          <Navigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
        </div>

        {/* Desktop Floating Toggle */}
        <div className="hidden lg:block">
          <FloatingToggle activeScreen={activeScreen} onScreenChange={setActiveScreen} />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}
