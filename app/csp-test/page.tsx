"use client"

import { useEffect, useState } from "react"

export default function CSPTestPage() {
  const [cspInfo, setCSPInfo] = useState<any>({})

  useEffect(() => {
    // Check if we're in v0 preview environment
    const isV0Preview =
      window.location.hostname.includes("vusercontent.net") ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("v0.dev")

    // Try to detect CSP policies
    const metaTags = Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'))
    const cspContent = metaTags.map((tag) => tag.getAttribute("content")).join(" ")

    setCSPInfo({
      hostname: window.location.hostname,
      origin: window.location.origin,
      isV0Preview,
      cspContent,
      userAgent: navigator.userAgent,
    })
  }, [])

  const testDirectRedirect = () => {
    // Test a direct redirect to Google (not through Supabase)
    const googleTestUrl =
      "https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=" +
      encodeURIComponent(window.location.origin) +
      "&response_type=code&scope=email"

    console.log("Testing direct Google redirect:", googleTestUrl)
    window.location.href = googleTestUrl
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">CSP & Environment Test</h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold text-blue-700">Environment Detection</h2>
          <div className="mt-2 space-y-2 text-sm">
            <p>
              <strong>Hostname:</strong> {cspInfo.hostname}
            </p>
            <p>
              <strong>Origin:</strong> {cspInfo.origin}
            </p>
            <p>
              <strong>Is v0 Preview:</strong> {cspInfo.isV0Preview ? "✅ Yes" : "❌ No"}
            </p>
          </div>
        </div>

        {cspInfo.isV0Preview && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h2 className="text-lg font-semibold text-yellow-700">v0 Preview Environment Detected</h2>
            <p className="text-yellow-600 text-sm mt-2">
              You're running in the v0 preview environment, which has strict CSP policies that prevent OAuth
              popups/frames. This is why Supabase OAuth isn't working as expected.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recommended Solutions</h2>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-700">1. Deploy to Vercel (Recommended)</h3>
              <p className="text-green-600 text-sm">
                Deploy this project to your own Vercel account where you have full control over CSP policies. Supabase
                OAuth will work normally there.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-700">2. Use Email/Password Auth for v0 Testing</h3>
              <p className="text-blue-600 text-sm">
                For testing in v0 preview, use Supabase email/password authentication instead of OAuth.
              </p>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <h3 className="font-medium text-purple-700">3. Mock Authentication for Prototyping</h3>
              <p className="text-purple-600 text-sm">
                Use mock authentication in v0 preview and implement real OAuth after deployment.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Test Direct Google Redirect</h2>
          <p className="text-sm text-gray-600 mb-3">
            This will test if the issue is specifically with Supabase or with OAuth redirects in general:
          </p>
          <button onClick={testDirectRedirect} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            Test Direct Google OAuth (Will Fail - Demo Only)
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Note: This will fail because we don't have a real Google OAuth client configured, but it tests the redirect
            mechanism.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">CSP Information</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-40 text-xs">
            {JSON.stringify(cspInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-8">
          <a href="/auth-debug" className="text-blue-500 hover:underline mr-4">
            Back to Auth Debug
          </a>
          <a href="/" className="text-blue-500 hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
