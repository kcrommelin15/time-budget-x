"use client"

import type React from "react"
import { useState } from "react"
import { X, Mail, Lock, User, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isInitialLoad?: boolean
}

export default function AuthModal({ isOpen, onClose, isInitialLoad = false }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isSupabaseConfigured } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      setError("Authentication not configured. Please set up Supabase environment variables.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(formData.email, formData.password)
        if (error) throw error
      } else {
        const { error } = await signUpWithEmail(formData.email, formData.password, formData.name)
        if (error) throw error
      }
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Authentication not configured. Please set up Supabase environment variables.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Authentication not configured. Please set up Supabase environment variables.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Note: GitHub OAuth would need to be configured in Supabase as well
      setError("GitHub authentication not yet configured. Please use Google or email.")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-3xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">{isLogin ? "Sign In" : "Create Account"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              {!isSupabaseConfigured ? (
                <p>
                  <strong>Setup Required:</strong> To enable authentication, please configure your Supabase environment
                  variables.
                </p>
              ) : (
                <p>
                  Note: To ensure your data is safely stored and accessible across devices, we recommend signing in.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Environment Variables Required:</strong>
                <br />
                Add these to your <code>.env.local</code> file:
                <br />
                <code>NEXT_PUBLIC_SUPABASE_URL=your_url_here</code>
                <br />
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here</code>
              </p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading || !isSupabaseConfigured}
              variant="outline"
              className="w-full h-12 rounded-2xl border-gray-300"
            >
              <Mail className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <Button
              onClick={handleGitHubLogin}
              disabled={loading || !isSupabaseConfigured}
              variant="outline"
              className="w-full h-12 rounded-2xl border-gray-300"
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 rounded-xl"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 rounded-xl"
                  placeholder="Enter your email"
                  required
                  disabled={loading || !isSupabaseConfigured}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 rounded-xl"
                  placeholder="Enter your password"
                  required
                  disabled={loading || !isSupabaseConfigured}
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col space-y-4 text-center">
            {isInitialLoad && (
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
              >
                I'll do it later
              </button>
            )}
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
