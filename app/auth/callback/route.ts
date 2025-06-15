import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // If no code is present, redirect to home page
  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  }

  try {
    // Create a Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookies().set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookies().set({ name, value: "", ...options })
        },
      },
    })

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }

    // Redirect to the home page
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent("Unexpected error during authentication")}`, requestUrl.origin),
    )
  }
}
