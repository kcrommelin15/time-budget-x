import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    try {
      const supabase = createClient(
        "https://jxwvedmbnnhmnuujjxwc.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s",
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error("Auth callback error:", error)
      }
    } catch (error) {
      console.error("Auth callback exception:", error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
