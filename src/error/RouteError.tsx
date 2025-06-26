import { Button } from "ti-react-template/components";
import { useNavigate } from "@tanstack/react-router";

interface RouteErrorProps {
  error: Error;
  status?: number;
}

export function RouteError({ error, status }: RouteErrorProps) {
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (status === 403) {
      return "You don't have permission to access this page.";
    }
    return error.message || "An unexpected error occurred";
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-lg w-full space-y-6 p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {status ? `Error ${status}` : "Error"}
          </h2>
          <p className="mt-2 text-gray-600">{getErrorMessage()}</p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-left text-xs bg-gray-50 p-4 rounded overflow-auto max-h-32">
              {error.stack}
            </pre>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate({ to: "/training" })}
            variant="outline"
          >
            Go Home
          </Button>
          <Button
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
