import { createClient } from "@supabase/supabase-js"

// For debugging purposes, log the URL we're trying to connect to
const supabaseUrl = "https://jxwvedmbnhmnuujjxwc.supabase.co"
console.log("Attempting to connect to Supabase at:", supabaseUrl)

// Your provided anon key
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s"

// Create a function to test if the Supabase URL is reachable
async function testSupabaseConnection() {
  try {
    const response = await fetch(supabaseUrl)
    console.log("Supabase connection test result:", response.status)
    return response.ok
  } catch (error) {
    console.error("Supabase connection test failed:", error)
    return false
  }
}

// Test the connection when this module loads
testSupabaseConnection()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string | null
}
