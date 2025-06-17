"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Home, Calendar, BarChart3, Settings } from "lucide-react"
import BudgetScreen from "@/components/budget-screen"
import TimelineScreen from "@/components/timeline-screen"
import InsightsScreen from "@/components/insights-screen"
import EnhancedSettingsScreen from "@/components/enhanced-settings-screen"
import AuthModal from "@/components/auth-modal"

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeScreen, setActiveScreen] = useState("budget")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === "SIGNED_IN") {
        setIsAuthModalOpen(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const renderScreen = () => {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Time Budget</h1>
            <p className="text-gray-600 mb-6">Please sign in to continue</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }

    switch (activeScreen) {
      case "budget":
        return <BudgetScreen isDesktop={isDesktop} user={user} />
      case "timeline":
        return <TimelineScreen isDesktop={isDesktop} user={user} />
      case "insights":
        return <InsightsScreen isDesktop={isDesktop} user={user} />
      case "settings":
        return <EnhancedSettingsScreen isDesktop={isDesktop} user={user} onSignOut={handleSignOut} />
      default:
        return <BudgetScreen isDesktop={isDesktop} user={user} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}

      {/* Bottom Navigation */}
      {user && !isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setActiveScreen("budget")}
              className={`flex flex-col items-center p-2 ${
                activeScreen === "budget" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Budget</span>
            </button>
            <button
              onClick={() => setActiveScreen("timeline")}
              className={`flex flex-col items-center p-2 ${
                activeScreen === "timeline" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs mt-1">Timeline</span>
            </button>
            <button
              onClick={() => setActiveScreen("insights")}
              className={`flex flex-col items-center p-2 ${
                activeScreen === "insights" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1">Insights</span>
            </button>
            <button
              onClick={() => setActiveScreen("settings")}
              className={`flex flex-col items-center p-2 ${
                activeScreen === "settings" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
