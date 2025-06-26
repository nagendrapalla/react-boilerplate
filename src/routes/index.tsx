import {
  createBrowserRouter,
  Router,
  RootRoute,
  Route,
} from '@tanstack/react-router';
import PublicLayout from '../layouts/PublicLayout';
import SecureLayout from '../layouts/SecureLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';

const rootRoute = new RootRoute({
  component: () => <Router />,
});

const publicRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PublicLayout,
});

const loginRoute = new Route({
  getParentRoute: () => publicRoute,
  path: '/login',
  component: Login,
});

const secureRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: SecureLayout,
});

const dashboardRoute = new Route({
  getParentRoute: () => secureRoute,
  path: '/dashboard',
  component: Dashboard,
});

export const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([loginRoute]),
  secureRoute.addChildren([dashboardRoute]),
]);

export const router = createBrowserRouter({ routeTree });
