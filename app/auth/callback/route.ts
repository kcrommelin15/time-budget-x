import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        // Successful authentication
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          return NextResponse.redirect(`${requestUrl.origin}/`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/`)
        }
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent("Authentication failed")}`)
    }
  }

  // No code parameter - redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
