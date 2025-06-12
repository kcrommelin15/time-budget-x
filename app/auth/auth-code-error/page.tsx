import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">
            There was an error during the authentication process. This could be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
            <li>• The authentication link has expired</li>
            <li>• The authentication was cancelled</li>
            <li>• There was a temporary server issue</li>
          </ul>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Return to App</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Try Again</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
