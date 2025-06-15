import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback - URL:", requestUrl.toString())
  console.log("Auth callback - Code:", code ? "present" : "missing")
  console.log("Auth callback - Error:", error, errorDescription)

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/?auth_error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        console.log("Successfully authenticated user:", data.user?.email)

        // Handle different environments
        const host = request.headers.get("host")
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"
        const isV0Env = host?.includes("v0.dev") || forwardedHost?.includes("v0.dev")

        console.log("Environment - host:", host, "forwardedHost:", forwardedHost, "isV0:", isV0Env)

        // Redirect back to the app
        return NextResponse.redirect(`${requestUrl.origin}/?auth_success=true`)
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${requestUrl.origin}/?auth_error=${encodeURIComponent("Authentication failed")}`)
    }
  }

  // No code parameter - redirect to home
  return NextResponse.redirect(
    `${requestUrl.origin}/?auth_error=${encodeURIComponent("No authorization code received")}`,
  )
}
