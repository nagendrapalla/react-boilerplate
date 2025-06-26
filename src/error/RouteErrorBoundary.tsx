import { ErrorBoundary } from "react-error-boundary";
import { RouteError } from "./RouteError";
import { useRouteError } from "./useRouteError";

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const { error, status, handleError } = useRouteError();

  if (error) {
    return <RouteError error={error} status={status} />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={RouteError}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
