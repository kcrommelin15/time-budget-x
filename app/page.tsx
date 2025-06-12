"use client"

import { useState, useEffect } from "react"
import BudgetScreen from "@/components/budget-screen"
import TimelineScreen from "@/components/timeline-screen"
import EnhancedInsightsScreen from "@/components/enhanced-insights-screen"
import EnhancedSettingsScreen from "@/components/enhanced-settings-screen"
import Navigation from "@/components/navigation"
import FloatingToggle from "@/components/floating-toggle"
import AuthModal from "@/components/auth-modal"
import { createClient } from "@supabase/supabase-js"

export default function TimeBudgetApp() {
  const [activeScreen, setActiveScreen] = useState<"budget" | "timeline" | "insights" | "settings">("budget")
  const [user, setUser] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Create a direct Supabase client - simplest approach
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    // Check for auth state on load
    const checkUser = async () => {
      try {
        console.log("Checking auth state...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setAuthError(`Session error: ${error.message}`)
          return
        }

        if (data?.session?.user) {
          console.log("User is authenticated:", data.session.user)
          setUser(data.session.user)
        } else {
          console.log("No authenticated user found")
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err)
        setAuthError(`Auth check error: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsInitialLoad(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isInitialLoad && !user) {
      setShowAuthModal(true)
    }
  }, [isInitialLoad, user])

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

      <div className="max-w-7xl mx-auto min-h-screen relative z-10">
        {/* Desktop Layout - Single Page */}
        <div className="hidden lg:block min-h-screen">
          <div className="max-w-4xl mx-auto relative">
            {activeScreen === "budget" && <BudgetScreen isDesktop={true} />}
            {activeScreen === "timeline" && <TimelineScreen isDesktop={true} />}
            {activeScreen === "insights" && <EnhancedInsightsScreen />}
            {activeScreen === "settings" && (
              <EnhancedSettingsScreen user={user} onAuth={setUser} onLogout={() => setUser(null)} />
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto bg-white/60 backdrop-blur-xl min-h-screen relative rounded-t-3xl mt-4 shadow-2xl border border-white/40 overflow-hidden">
          {activeScreen === "budget" && <BudgetScreen />}
          {activeScreen === "timeline" && <TimelineScreen />}
          {activeScreen === "insights" && <EnhancedInsightsScreen />}
          {activeScreen === "settings" && (
            <EnhancedSettingsScreen user={user} onAuth={setUser} onLogout={() => setUser(null)} />
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
        onAuth={setUser}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}
