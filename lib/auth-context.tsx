"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, type AuthUser } from "./supabase"

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setError(error.message)
        } else if (data?.session) {
          setSession(data.session)
          setUser(transformUser(data.session.user))
        }
      } catch (err: any) {
        console.error("Unexpected error getting session:", err)
        setError(err.message || "Failed to get session")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event)
        setSession(session)
        if (session?.user) {
          setUser(transformUser(session.user))
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (err: any) {
      console.error("Error setting up auth listener:", err)
      setError(err.message || "Failed to set up auth listener")
      setLoading(false)
      return () => {}
    }
  }, [])

  const transformUser = (supabaseUser: User): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        supabaseUser.email?.split("@")[0] ||
        "User",
      avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (err: any) {
      console.error("Sign in error:", err)
      return { error: { message: err.message || "Failed to sign in" } }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (err: any) {
      console.error("Sign up error:", err)
      return { error: { message: err.message || "Failed to sign up" } }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign in...")
      console.log("Current origin:", window.location.origin)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
      } else {
        console.log("Google sign in initiated successfully")
      }

      return { error }
    } catch (err: any) {
      console.error("Google sign in exception:", err)
      return { error: { message: err.message || "Failed to sign in with Google" } }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
