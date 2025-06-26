import { FallbackProps } from "react-error-boundary";
import { Button } from "ti-react-template/components";
import { ErrorIllustration } from "./ErrorIllustration";

function getErrorMessage(error: Error): string {
  if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
    return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
  }
  if (error.message.includes("timeout")) {
    return "The request took too long to complete. Please try again.";
  }
  if (error.message.includes("401")) {
    return "Your session has expired. Please log in again.";
  }
  if (error.message.includes("403")) {
    return "You don't have permission to access this resource.";
  }
  return "We encountered an unexpected error. Our team has been notified and is working on it.";
}

export function GlobalError({ error, resetErrorBoundary }: FallbackProps) {
  const friendlyMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <ErrorIllustration className="w-32 h-32 mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something's not right
          </h2>
          
          <p className="text-gray-600 mb-6">
            {friendlyMessage}
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-left">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Technical Details:
              </div>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-40 border border-gray-200">
                <code className="text-gray-600">
                  {error.name}: {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </code>
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Refresh Page
          </Button>
          <Button
            onClick={resetErrorBoundary}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            If this problem persists, please contact our{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:text-primary/80 underline"
            >
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
