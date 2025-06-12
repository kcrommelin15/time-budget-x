"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "./supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured - authentication disabled")
      setLoading(false)
      return
    }

    console.log("Supabase configured, initializing auth...")

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error)
        } else {
          console.log("Initial session:", session ? "Found" : "None")
          setSession(session)
          setUser(session?.user ?? null)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error getting session:", error)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "User signed in" : "User signed out")
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured")

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured")

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured")

    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured")

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  }

  const value = {
    user,
    session,
    loading,
    isSupabaseConfigured: isSupabaseConfigured(),
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
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
