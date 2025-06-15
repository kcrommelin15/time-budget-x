"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

export default function TestSupabase() {
  const [status, setStatus] = useState("Testing...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...")
        console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...")

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        // Test basic connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setError(`Session error: ${error.message}`)
          setStatus("❌ Supabase connection failed")
        } else {
          setStatus("✅ Supabase connection successful")
          console.log("Session data:", data)
        }

        // Test OAuth URL generation
        const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true, // Don't actually redirect, just test URL generation
          },
        })

        if (oauthError) {
          setError((prev) => prev + ` | OAuth error: ${oauthError.message}`)
        } else {
          console.log("OAuth URL would be:", oauthData.url)
        }
      } catch (err) {
        setError(`Unexpected error: ${err}`)
        setStatus("❌ Test failed")
      }
    }

    testConnection()
  }, [])

  const testOAuthRedirect = async () => {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      console.log("Testing OAuth redirect...")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (error) {
        setError(`OAuth redirect error: ${error.message}`)
      } else {
        console.log("OAuth redirect initiated:", data)
      }
    } catch (err) {
      setError(`OAuth redirect failed: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Connection Status:</h2>
            <p className="text-lg">{status}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-semibold text-red-800">Errors:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables:</h3>
            <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Missing"}</p>
            <p>ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing"}</p>
          </div>

          <button onClick={testOAuthRedirect} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Test Google OAuth Redirect
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Current URL Info:</h3>
            <p>Origin: {typeof window !== "undefined" ? window.location.origin : "Loading..."}</p>
            <p>Full URL: {typeof window !== "undefined" ? window.location.href : "Loading..."}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
