import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") ?? "/"

  console.log("Email verification - token_hash:", token_hash ? "present" : "missing")
  console.log("Email verification - type:", type)

  if (token_hash && type) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)

      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error("Error verifying email:", error)
        return NextResponse.redirect(`${requestUrl.origin}/?verification_error=${encodeURIComponent(error.message)}`)
      }

      console.log("Email verification successful")
      // Redirect to success page
      return NextResponse.redirect(`${requestUrl.origin}/?verification_success=true`)
    } catch (err) {
      console.error("Unexpected error during email verification:", err)
      return NextResponse.redirect(
        `${requestUrl.origin}/?verification_error=${encodeURIComponent("Verification failed")}`,
      )
    }
  }

  // No token_hash or type - redirect to home with error
  return NextResponse.redirect(
    `${requestUrl.origin}/?verification_error=${encodeURIComponent("Invalid verification link")}`,
  )
}
