"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function AuthDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Create a direct Supabase client
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs((prev) => [...prev, logMessage])
  }

  useEffect(() => {
    addLog("Page loaded, checking initial auth state...")

    async function checkAuth() {
      try {
        addLog("Calling supabase.auth.getSession()...")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          addLog(`Session error: ${sessionError.message}`)
          setError(`Session error: ${sessionError.message}`)
          return
        }

        addLog(`Session data received: ${sessionData?.session ? "Session exists" : "No session"}`)
        setSessionData(sessionData)

        // Get user
        if (sessionData?.session) {
          addLog("Session found, getting user details...")
          const { data: userData, error: userError } = await supabase.auth.getUser()
          if (userError) {
            addLog(`User error: ${userError.message}`)
            setError(`User error: ${userError.message}`)
            return
          }
          addLog(`User data received: ${userData?.user?.email || "No email"}`)
          setUserDetails(userData)
        } else {
          addLog("No session found")
        }
      } catch (err) {
        const errorMsg = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        addLog(errorMsg)
        setError(errorMsg)
      }
    }

    checkAuth()

    // Listen for auth changes
    addLog("Setting up auth state change listener...")
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state changed: ${event}`)
      if (session?.user) {
        addLog(`User in session: ${session.user.email}`)
      }
      checkAuth()
    })

    return () => {
      addLog("Cleaning up auth listener...")
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  // Check for URL fragments that might indicate OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    if (urlParams.toString()) {
      addLog(`URL search params: ${urlParams.toString()}`)
    }
    if (hashParams.toString()) {
      addLog(`URL hash params: ${hashParams.toString()}`)
    }

    // Check for common OAuth error parameters
    const error = urlParams.get("error") || hashParams.get("error")
    const errorDescription = urlParams.get("error_description") || hashParams.get("error_description")

    if (error) {
      addLog(`OAuth error in URL: ${error} - ${errorDescription}`)
      setError(`OAuth error: ${error} - ${errorDescription}`)
    }

    // Check for access token in hash (indicates successful OAuth)
    const accessToken = hashParams.get("access_token")
    if (accessToken) {
      addLog("Access token found in URL hash - OAuth callback detected")
    }
  }, [])

  const handleSignOut = async () => {
    addLog("Starting sign out...")
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
        setError(`Sign out error: ${error.message}`)
      } else {
        addLog("Sign out successful")
      }
    } catch (err) {
      const errorMsg = `Sign out unexpected error: ${err instanceof Error ? err.message : String(err)}`
      addLog(errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    addLog("Starting Google sign in with manual redirect...")
    setIsLoading(true)
    setError(null)

    try {
      // Build the OAuth URL manually to force full page redirect
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const redirectTo = encodeURIComponent(`${window.location.origin}/auth-debug`)

      // Construct the Google OAuth URL manually
      const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`

      addLog(`Manual OAuth URL: ${oauthUrl}`)
      addLog("Performing manual redirect to bypass CSP restrictions...")

      // Force a full page redirect
      window.location.href = oauthUrl
    } catch (err) {
      const errorMsg = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      addLog(errorMsg)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const handleSupabaseOAuth = async () => {
    addLog("Trying Supabase's built-in OAuth method...")
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-debug`,
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        addLog(`Supabase OAuth error: ${error.message}`)
        setError(`Supabase OAuth error: ${error.message}`)
        setIsLoading(false)
      } else {
        addLog("Supabase OAuth initiated successfully...")
      }
    } catch (err) {
      const errorMsg = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      addLog(errorMsg)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

        {/* CSP Warning */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="text-lg font-semibold text-yellow-700">CSP Issue Detected</h2>
          <p className="text-yellow-600 text-sm">
            The v0 preview environment has Content Security Policy restrictions. We're now using manual URL construction
            to bypass Supabase's popup logic entirely.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-lg font-semibold text-red-700">Error</h2>
            <p className="text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md">
              Clear Error
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <p className="mb-2">
            Status: <span className="font-medium">{sessionData?.session ? "Authenticated" : "Not Authenticated"}</span>
          </p>

          <div className="flex flex-col space-y-3 mt-4">
            {!sessionData?.session ? (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? "Redirecting..." : "Sign in with Google (Manual Redirect)"}
                </button>

                <button
                  onClick={handleSupabaseOAuth}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {isLoading ? "Trying..." : "Try Supabase OAuth (May Fail)"}
                </button>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? "Signing out..." : "Sign Out"}
              </button>
            )}
          </div>
        </div>

        {/* Debug Logs Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Debug Logs</h2>
            <button onClick={clearLogs} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">
              Clear Logs
            </button>
          </div>
          <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-60 overflow-auto">
            {logs.length === 0 ? <p>No logs yet...</p> : logs.map((log, index) => <div key={index}>{log}</div>)}
          </div>
        </div>

        {sessionData?.session && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Session Information</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>

            {userDetails && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">User Details</h2>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {JSON.stringify(userDetails, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <p className="mb-1">
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not Set"}
          </p>
          <p className="mb-1">
            <strong>URL Value:</strong>{" "}
            <code className="bg-gray-100 px-1 rounded text-sm">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code>
          </p>
          <p className="mb-1">
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not Set"}
          </p>
          <p>
            <strong>Key Value:</strong>{" "}
            <code className="bg-gray-100 px-1 rounded text-sm">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
            </code>
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Manual OAuth URL</h2>
          <p className="text-sm text-gray-600 mb-2">This is the URL we'll redirect to:</p>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=
            {encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/auth-debug`)}
          </code>
        </div>

        <div className="mt-8">
          <a href="/" className="text-blue-500 hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
