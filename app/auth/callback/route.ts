// No changes needed here if lib/supabase/server.ts is correct
// and the logging from the previous suggestion is in place.
// Ensure you are checking Vercel function logs for this route.

import { createClient } from "@/lib/supabase/server" // This should now use the robust server client
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  console.log("Auth callback route hit!")

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("Received code:", code)
  console.log("Origin:", origin)

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore) // Uses the server client
    console.log("Attempting to exchange code for session...")
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error.message, error)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?message=${encodeURIComponent(error.message)}&details=${encodeURIComponent(JSON.stringify(error))}`,
      )
    }
    console.log("Session exchanged successfully. Session data:", data.session ? "Exists" : "Does NOT exist")
    // If data.session is null here, that's a big problem.
  } else {
    console.warn("No code found in auth callback URL.")
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=No%20auth%20code%20received`)
  }

  console.log(`Redirecting to: ${origin}/`)
  return NextResponse.redirect(`${origin}/`)
}
