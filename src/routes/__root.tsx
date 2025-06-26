import { Outlet, createRootRoute, useRouter } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalError } from "../error/GlobalError";
import { NotFound } from "../error/NotFound";
import { Suspense } from "react";
import { GlobalLoader } from "ti-react-template/components";
import { SideNavbar } from "@/shared/components/side-navbar";
import { useIsAuthenticated } from "@/domains/auth/store/authAtom";

function RootLayout() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const pathname = router.state.location.pathname;
  const isLoginPage = pathname === "/training" || pathname === "/training/";

  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <ErrorBoundary FallbackComponent={GlobalError}>
      <Suspense fallback={<GlobalLoader />}>
        <div className={`flex h-screen bg-gray-50 root-layout ${!isAuthenticated ? 'fade-in' : ''}`}>
          {showSidebar && <SideNavbar />}
          <div
            className={`flex-1 ${showSidebar ? "pl-4 overflow-y-scroll" : ""}`}
          >
            <Outlet />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ error }) => (
    <GlobalError
      error={error}
      resetErrorBoundary={() => window.location.reload()}
    />
  ),
});
