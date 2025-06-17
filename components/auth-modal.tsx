"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Mail, Lock, User, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: SupabaseUser) => void
  isInitialLoad?: boolean
}

type AuthStep = "email" | "password" | "signup" | "verify-email"

export default function AuthModal({ isOpen, onClose, onAuth, isInitialLoad = false }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailExists, setEmailExists] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    // Reset form and error state when modal opens/closes
    if (isOpen) {
      setStep("email")
      setError(null)
      setIsLoading(false)
    } else {
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setName("")
      setError(null)
      setIsLoading(false)
      setEmailExists(false)
      setResendCooldown(0)
    }
  }, [isOpen])

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Listen for auth changes to close modal when user is verified
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user && step === "verify-email") {
        onAuth(session.user)
        onClose()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, step, onAuth, onClose])

  if (!isOpen) return null

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Checking if email exists in database:", email)

      // Call our database function to check if user exists
      const { data, error } = await supabase.rpc("check_user_exists_by_email", {
        email_address: email.toLowerCase().trim(),
      })

      if (error) {
        console.error("Error calling check_user_exists_by_email:", error)
        setError("Unable to verify email. Please try again.")
        return
      }

      console.log("User exists result:", data)
      setEmailExists(data)

      if (data === true) {
        // User exists in our database
        console.log("User exists - going to password flow")
        setStep("password")
      } else {
        // User doesn't exist in our database
        console.log("User doesn't exist - going to signup flow")
        setStep("signup")
      }
    } catch (err) {
      console.error("Unexpected error checking email:", err)
      setError("Unable to verify email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Incorrect password. Please try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before signing in.")
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        onAuth(data.user)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("This email is already registered. Please sign in instead.")
          setEmailExists(true)
          setStep("password")
          return
        }
        setError(error.message)
      } else if (data.user) {
        // Check if user needs email confirmation
        if (data.user && !data.session) {
          console.log("User created, needs email verification")
          setStep("verify-email")
        } else {
          // User is immediately signed in (email confirmation disabled)
          onAuth(data.user)
          onClose()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        setError(error.message)
      } else {
        setResendCooldown(60) // 60 second cooldown
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: "google") => {
    setIsLoading(true)
    setError(null)

    try {
      await supabase.auth.signOut()
      const currentOrigin = window.location.origin
      const redirectTo = `${currentOrigin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "https://www.googleapis.com/auth/userinfo.email",
        },
      })

      if (error) {
        setError(`OAuth error: ${error.message}`)
        setIsLoading(false)
      }
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === "verify-email") {
      setStep("signup")
    } else {
      setStep("email")
    }
    setError(null)
    setPassword("")
    setConfirmPassword("")
    setName("")
  }

  const getTitle = () => {
    switch (step) {
      case "email":
        return "Welcome"
      case "password":
        return "Enter your password"
      case "signup":
        return "Create your account"
      case "verify-email":
        return "Check your email"
      default:
        return "Welcome"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-3xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {step !== "email" && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-xl p-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6">
          {step === "email" && (
            <>
              {/* Email Step */}
              <form onSubmit={handleEmailContinue} className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Checking..." : "Continue"}
                </Button>
              </form>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => handleOAuthLogin("google")}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-gray-300"
                  disabled={isLoading}
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>
              </div>

              {isInitialLoad && (
                <div className="text-center mb-6">
                  <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-medium">
                    I'll do it later
                  </button>
                </div>
              )}

              {/* Note and Terms */}
              <div className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4">
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
                    <p>
                      Note: To ensure your data is safely stored and accessible across devices, we recommend signing in.
                      You can always do this later in Settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              {/* Password Step */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Welcome back! Enter your password for <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Enter your password"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={isLoading || !password}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Forgot your password?</button>
              </div>

              <div className="mt-4 text-center">
                <button onClick={() => setStep("signup")} className="text-gray-600 hover:text-gray-800 text-sm">
                  Don't have an account? Create one instead
                </button>
              </div>
            </>
          )}

          {step === "signup" && (
            <>
              {/* Signup Step */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Create your account for <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Enter your full name"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Create a password (min 6 characters)"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={isLoading || !name || !password || !confirmPassword}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => setStep("password")} className="text-gray-600 hover:text-gray-800 text-sm">
                  Already have an account? Sign in instead
                </button>
              </div>
            </>
          )}

          {step === "verify-email" && (
            <>
              {/* Email Verification Step */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a verification link to <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Click the link in the email to verify your account. After verification, you can close this window
                    and sign in.
                  </p>
                  <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                    💡 Tip: After clicking the verification link, come back here and try signing in with your email and
                    password.
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="w-full h-12 rounded-2xl"
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend verification email"
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setStep("email")
                      setError(null)
                    }}
                    variant="ghost"
                    className="w-full h-12 rounded-2xl"
                  >
                    I've verified my email, let me sign in
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Didn't receive the email? Check your spam folder or try resending.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
