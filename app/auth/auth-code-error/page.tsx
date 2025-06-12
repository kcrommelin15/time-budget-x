export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">Sorry, we couldn't complete your sign-in. This might be due to:</p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li>• The authentication link has expired</li>
            <li>• There was a network issue</li>
            <li>• The OAuth configuration needs to be updated</li>
          </ul>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
