"use client"

import { useState } from "react"
import { LogOut, Slack, Bell, HelpCircle, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import AuthModal from "@/components/auth-modal"

interface EnhancedSettingsScreenProps {
  user?: any
  onAuth?: (user: any) => void
  onLogout?: () => void
}

export default function EnhancedSettingsScreen({ user, onAuth, onLogout }: EnhancedSettingsScreenProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [notifications, setNotifications] = useState({
    push: true,
  })
  const [aiEnhancements, setAiEnhancements] = useState({
    smartSuggestions: true,
    autoGapFilling: false,
    autoCategorizeText: true,
    autoCategorizeIntegrations: true,
    advancedInsights: false,
  })

  const handleAuth = (userData: any) => {
    onAuth?.(userData)
    setIsAuthModalOpen(false)
  }

  // Mock streak data - in real app this would come from user data
  const streakDays = 23

  return (
    <div className="p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* User Profile Section */}
      {!user ? (
        <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl p-12 mb-8 text-center relative overflow-hidden min-h-[300px] flex flex-col justify-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div className="absolute top-1/2 right-8 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Start Tracking Smarter</h2>
            <p className="text-white/90 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
              Sync your data across devices and get AI-powered insights to optimize your time.
            </p>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-3xl h-20 px-16 text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
            >
              Sign In / Sign Up
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-lg max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
            <p className="text-gray-600 text-lg mb-4">{user.email}</p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-semibold text-gray-900">{streakDays} days</span>
              </div>
              <span className="text-sm text-gray-600">tracking streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Integrations */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Integrations</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Slack className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Slack</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="text-sm text-green-600">Connected</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Manage
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4z" />
                    <path d="M7 6h10v2H7V6zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Trello</p>
                  <p className="text-sm text-gray-600">Sync with Trello boards</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Connect
              </Button>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
              AI Features
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Smart Tracking Suggestions</p>
                <p className="text-sm text-gray-600">Get AI-powered suggestions for better time tracking</p>
              </div>
              <Switch
                checked={user ? aiEnhancements.smartSuggestions : aiEnhancements.smartSuggestions}
                disabled={false}
                onCheckedChange={(checked) => setAiEnhancements({ ...aiEnhancements, smartSuggestions: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto Gap Filling</p>
                <p className="text-sm text-gray-600">Automatically fill gaps in your timeline</p>
              </div>
              <Switch
                checked={user ? aiEnhancements.autoGapFilling : aiEnhancements.autoGapFilling}
                disabled={false}
                onCheckedChange={(checked) => setAiEnhancements({ ...aiEnhancements, autoGapFilling: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto Categorize Text Inputs</p>
                <p className="text-sm text-gray-600">Automatically categorize manual entries</p>
              </div>
              <Switch
                checked={user ? aiEnhancements.autoCategorizeText : aiEnhancements.autoCategorizeText}
                disabled={false}
                onCheckedChange={(checked) => setAiEnhancements({ ...aiEnhancements, autoCategorizeText: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto Categorize Integration Inputs</p>
                <p className="text-sm text-gray-600">Smart categorization from Slack, Trello, etc.</p>
              </div>
              <Switch
                checked={user ? aiEnhancements.autoCategorizeIntegrations : aiEnhancements.autoCategorizeIntegrations}
                disabled={false}
                onCheckedChange={(checked) =>
                  setAiEnhancements({ ...aiEnhancements, autoCategorizeIntegrations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Advanced Insights</p>
                <p className="text-sm text-gray-600">Deep analytics and productivity patterns</p>
              </div>
              <Switch
                checked={user ? aiEnhancements.advancedInsights : aiEnhancements.advancedInsights}
                disabled={false}
                onCheckedChange={(checked) => setAiEnhancements({ ...aiEnhancements, advancedInsights: checked })}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notifications
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Get notified about tracking reminders</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              Help & Support
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl">
              Feature Requests
            </Button>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      {user && (
        <div className="mt-8">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      )}

      {/* Delete Account - Only show when signed in */}
      {user && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Delete Account
          </Button>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuth={handleAuth} />
    </div>
  )
}
