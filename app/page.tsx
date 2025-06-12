"use client"

import { useState, useEffect } from "react"
import BudgetScreen from "@/components/budget-screen"
import TimelineScreen from "@/components/timeline-screen"
import EnhancedInsightsScreen from "@/components/enhanced-insights-screen"
import EnhancedSettingsScreen from "@/components/enhanced-settings-screen"
import Navigation from "@/components/navigation"
import FloatingToggle from "@/components/floating-toggle"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/hooks/use-auth"

export default function TimeBudgetApp() {
  const [activeScreen, setActiveScreen] = useState<"budget" | "timeline" | "insights" | "settings">("budget")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && isInitialLoad && !user) {
      setShowAuthModal(true)
      setIsInitialLoad(false)
    }
  }, [loading, isInitialLoad, user])

  // Close auth modal when user signs in
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
    }
  }, [user, showAuthModal])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Subtle gradient overlay for extra glossiness */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto min-h-screen relative z-10">
        {/* Desktop Layout - Single Page */}
        <div className="hidden lg:block min-h-screen">
          <div className="max-w-4xl mx-auto relative">
            {activeScreen === "budget" && <BudgetScreen isDesktop={true} />}
            {activeScreen === "timeline" && <TimelineScreen isDesktop={true} />}
            {activeScreen === "insights" && <EnhancedInsightsScreen />}
            {activeScreen === "settings" && <EnhancedSettingsScreen user={user} />}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto bg-white/60 backdrop-blur-xl min-h-screen relative rounded-t-3xl mt-4 shadow-2xl border border-white/40 overflow-hidden">
          {activeScreen === "budget" && <BudgetScreen />}
          {activeScreen === "timeline" && <TimelineScreen />}
          {activeScreen === "insights" && <EnhancedInsightsScreen />}
          {activeScreen === "settings" && <EnhancedSettingsScreen user={user} />}
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isInitialLoad={isInitialLoad} />
    </div>
  )
}
