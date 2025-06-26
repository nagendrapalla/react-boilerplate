import { Button } from "ti-react-template/components";
import { useNavigate } from "@tanstack/react-router";
import { NotFoundIllustration } from "./ErrorIllustration";

export function NotFound() {
  // Safely handle navigation even if router context is not available
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate({ to: path });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full space-y-8 bg-white rounded-xl shadow-lg p-8 text-center">
        <NotFoundIllustration className="w-40 h-40 mx-auto" />
        
        <div>
          <p className="text-6xl font-bold text-gray-200 -mb-4">404</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">
            Oops! We couldn't find the page you're looking for.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => handleNavigate("/")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Lost? View our{" "}
            <button
              onClick={() => handleNavigate("/")}
              className="text-primary hover:text-primary/80 underline"
            >
              sitemap
            </button>
            {" "}or{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:text-primary/80 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
