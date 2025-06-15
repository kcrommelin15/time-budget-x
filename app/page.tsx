"use client"

import { useState, useEffect } from "react"
import BudgetScreen from "@/components/budget-screen"
import TimelineScreen from "@/components/timeline-screen"
import EnhancedInsightsScreen from "@/components/enhanced-insights-screen"
import EnhancedSettingsScreen from "@/components/enhanced-settings-screen"
import Navigation from "@/components/navigation"
import FloatingToggle from "@/components/floating-toggle"
import AuthModal from "@/components/auth-modal"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function TimeBudgetApp() {
  const [activeScreen, setActiveScreen] = useState<"budget" | "timeline" | "insights" | "settings">("budget")
  const [user, setUser] = useState<User | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Check if Supabase is available
        if (!isSupabaseAvailable()) {
          console.log("Running in demo mode - Supabase not configured")
          if (mounted) {
            setIsDemoMode(true)
            setIsInitialLoad(false)
            // Don't show auth modal in demo mode
          }
          return
        }

        // Check for auth success/error in URL params
        const urlParams = new URLSearchParams(window.location.search)
        const authError = urlParams.get("auth_error")
        const authSuccess = urlParams.get("auth_success")

        if (authError) {
          setAuthError(`Authentication failed: ${authError}`)
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname)
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
          if (!session?.user && !authSuccess) {
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

    // Only set up auth listener if Supabase is available
    if (isSupabaseAvailable()) {
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
          // Don't automatically show auth modal on sign out
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(session.user)
        }
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }

    return () => {
      mounted = false
    }
  }, [supabase])

  const handleAuth = (userData: User) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    try {
      if (isSupabaseAvailable()) {
        await supabase.auth.signOut()
      }
      setUser(null)
      setAuthError(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Subtle gradient overlay for extra glossiness */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none"></div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded z-50">
          <p className="text-sm">Demo Mode - Authentication disabled</p>
        </div>
      )}

      {authError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{authError}</p>
          <button onClick={() => setAuthError(null)} className="absolute top-1 right-1 text-red-500">
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
              <EnhancedSettingsScreen user={user} onAuth={handleAuth} onLogout={handleLogout} isDemoMode={isDemoMode} />
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto bg-white/60 backdrop-blur-xl min-h-screen relative rounded-t-3xl mt-4 shadow-2xl border border-white/40 overflow-hidden">
          {activeScreen === "budget" && <BudgetScreen />}
          {activeScreen === "timeline" && <TimelineScreen />}
          {activeScreen === "insights" && <EnhancedInsightsScreen />}
          {activeScreen === "settings" && (
            <EnhancedSettingsScreen user={user} onAuth={handleAuth} onLogout={handleLogout} isDemoMode={isDemoMode} />
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

      {/* Only show auth modal if not in demo mode */}
      {!isDemoMode && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
          isInitialLoad={isInitialLoad}
        />
      )}
    </div>
  )
}
