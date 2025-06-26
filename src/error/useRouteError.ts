import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

export function useRouteError() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<number>();

  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", () => {
      setError(null);
      setStatus(undefined);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleError = (err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    // Handle common HTTP status codes
    if (error.message.includes("404")) {
      setStatus(404);
    } else if (error.message.includes("403")) {
      setStatus(403);
    } else if (error.message.includes("401")) {
      setStatus(401);
    } else {
      setStatus(500);
    }
    return error;
  };

  return { error, status, handleError };
}
