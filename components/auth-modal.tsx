"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, User, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: any) => void
  isInitialLoad?: boolean
}

export default function AuthModal({ isOpen, onClose, onAuth, isInitialLoad = false }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock authentication
    const user = {
      id: "1",
      name: formData.name || "John Doe",
      email: formData.email,
      avatar: null,
    }

    onAuth(user)
    onClose()
  }

  const handleOAuthLogin = (provider: string) => {
    // Mock OAuth login
    const user = {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: null,
    }

    onAuth(user)
    onClose()
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
              <p>Note: To ensure your data is safely stored and accessible across devices, we recommend signing in.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleOAuthLogin("google")}
              variant="outline"
              className="w-full h-12 rounded-2xl border-gray-300"
            >
              <Mail className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <Button
              onClick={() => handleOAuthLogin("github")}
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
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col space-y-4 text-center">
            {isInitialLoad && (
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-medium">
                I'll do it later
              </button>
            )}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 font-medium">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
