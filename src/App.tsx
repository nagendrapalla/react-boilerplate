import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalError } from "./error/GlobalError";
import { NotFound } from "./error/NotFound";
import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Provider } from "jotai";
import { hasAccessToken } from "./domains/auth/store/authAtom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create instances with default configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Expose queryClient globally for logout and other operations
// This allows us to access it from anywhere in the application
if (typeof window !== 'undefined') {
  (window as any).__REACT_QUERY_GLOBAL_CLIENT__ = queryClient;
}

// Create router with proper context
const router = createRouter({
  routeTree,
  context: {
    isAuthenticated: hasAccessToken(),
    queryClient, // Pass queryClient to router context
  },
  basepath: "/training",
  defaultNotFoundComponent: () => <NotFound />,
});

// Register router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface RouterContext {
    isAuthenticated: boolean
    queryClient: QueryClient
  }
}

// App render
function App() {
  return (
    <StrictMode>
      <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => <GlobalError error={error} resetErrorBoundary={resetErrorBoundary} />}>
        <QueryClientProvider client={queryClient}>
          <Provider>
            <RouterProvider router={router} />
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick={true}
              pauseOnHover={true}
              draggable={true}
            />
          </Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

// Mount the app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
