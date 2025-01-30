export default function UnauthorizedPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">401 Unauthorized</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <a href="/" className="text-blue-500 hover:text-blue-700">
            Return to Home
          </a>
        </div>
      </div>
    );
  }