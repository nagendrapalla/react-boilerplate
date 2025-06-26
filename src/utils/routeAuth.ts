import { redirect } from "@tanstack/react-router";
import { getItem } from "@/shared/utlis/localStorage";
import { hasAccessToken } from "../domains/auth/store/authAtom";

const PUBLIC_ROUTES = ["/"] as const;

export type Role = "ROLE_Student" | "ROLE_Instructor";

const ROUTE_ROLES: Record<string, ReadonlyArray<Role>> = {
  "/training/student": ["ROLE_Student", "ROLE_Instructor"],
  "/training/student/courses": ["ROLE_Student", "ROLE_Instructor"],
  "/training/student/courses/$courseId": ["ROLE_Student", "ROLE_Instructor"],
  "/training/student/courses/$courseId/quiz/$quizId": [
    "ROLE_Student",
    "ROLE_Instructor",
  ],
  "/training/tutor": ["ROLE_Instructor"],
} as const;

export function checkAuth(pathname: string) {
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname as any);
  const isAuthenticated = hasAccessToken();
  const role = getItem("role") as Role | null;

  // Allow public routes when not authenticated
  if (!isAuthenticated && isPublicRoute) {
    return;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    throw redirect({
      to: "/training",
      search: {
        redirect: pathname === "/training" ? undefined : pathname,
      },
    });
  }

  // Redirect authenticated users away from login
  if (isAuthenticated && isPublicRoute) {
    throw redirect({
      to: role === "ROLE_Instructor" ? "/training/tutor" : "/training/student",
    });
  }

  // Check role-based access
  const routePattern = Object.keys(ROUTE_ROLES).find((pattern) => {
    const regex = new RegExp("^" + pattern.replace(/\$\w+/g, "[^/]+") + "/?$");
    return regex.test(pathname);
  });

  if (routePattern && role) {
    const allowedRoles = ROUTE_ROLES[routePattern];
    if (!allowedRoles.includes(role)) {
      throw redirect({
        to: role === "ROLE_Instructor" ? "/training/tutor" : "/training/student",
      });
    }
  }
}
