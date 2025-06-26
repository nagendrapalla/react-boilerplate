import { getItem } from "@/shared/utlis/localStorage";
import { hasAccessToken } from "../domains/auth/store/authAtom";
import { z } from "zod";
import { redirectByRole } from "@/shared/utlis/routeUtils";
import { getCookie } from "@/shared/utlis/cookieUtils";
import { getPreviousPath, showLoadingAndRedirect } from "@/shared/utlis/authUtils";

// More permissive role schema to handle different role formats
const roleSchema = z.union([
  z.enum(["ROLE_Student", "ROLE_Instructor"]),
  z.enum(["student", "instructor"])
]).readonly();

/**
 * Determines if a path should allow access to both students and instructors
 * Uses regex patterns for precise matching of multi-role routes
 * @param pathname The current path being accessed
 * @returns boolean indicating if the path is accessible to both roles
 */
function isMultiRolePath(pathname: string): boolean {
  // Define regex patterns for precise path matching
  const topicsRouteRegex = /\/training\/student\/all-courses\/[\w-]+\/topics(\/|$)/;
  
  // Log the check for debugging
  console.log(`[isMultiRolePath] Checking if ${pathname} is a multi-role path`);
  
  // Check against the topics route regex
  if (topicsRouteRegex.test(pathname)) {
    console.log(`[isMultiRolePath] Match found with topics route pattern`);
    return true;
  }
  
  // No match found
  console.log(`[isMultiRolePath] No match found for ${pathname}`);
  return false;
}

/**
 * Authentication and authorization check for the current path
 * @param pathname The current path being accessed
 */
export function useAuthCheck(pathname: string) {
  // Double check for authentication using both hasAccessToken and direct cookie check
  const accessToken = getCookie("access_token");
  const isAuthenticated = hasAccessToken() !== null && accessToken !== null;

  console.log(`Auth check for path: ${pathname}, authenticated: ${isAuthenticated}`);

  // Allow unauthenticated access to trn (login) page
  if (!isAuthenticated && pathname === "/training/") {
    return;
  }

  // Redirect unauthenticated users to trn (login) page
  if (!isAuthenticated) {
    console.log(`Redirecting unauthenticated user from ${pathname} to login page`);
    
    // Show loading state before redirecting
    showLoadingAndRedirect('/training/', 'Redirecting to login page...');
    return;
  }

  // Parse and validate role for authenticated users
  const storedRole = getItem("role");
  const role = roleSchema.safeParse(storedRole);

  // Redirect authenticated users from login to their last path or role-specific page
  if ((pathname === "/training/" || pathname === "/training") && role.success) {
    // Get the previous path from session storage or referrer
    const roleDashboard = redirectByRole(role.data);
    const lastPath = getPreviousPath(roleDashboard);
    
    console.log(`Redirecting authenticated user from login page to: ${lastPath}`);
    showLoadingAndRedirect(lastPath, `Redirecting to your last location...`);
    return;
  }
  
  // Role-based authorization for student routes
  if (pathname.startsWith('/training/student') && role.success) {
    const normalizedRole = role.data.toUpperCase().includes('STUDENT') ? 'ROLE_Student' : role.data;
    
    // Check if this is a multi-role path that allows both students and instructors
    if (normalizedRole === 'ROLE_Instructor' && isMultiRolePath(pathname)) {
      console.log(`Multi-role path access: ${normalizedRole} accessing student path: ${pathname}`);
      return; // Allow access for instructors to specified student paths
    }
    
    // For other student paths, enforce student-only access
    if (normalizedRole !== 'ROLE_Student') {
      console.log(`Unauthorized role access attempt: ${normalizedRole} trying to access student page at ${pathname}`);
      
      // Get the previous path or use the role-based redirect as fallback
      const redirectTo = getPreviousPath(redirectByRole(normalizedRole));
      
      showLoadingAndRedirect(redirectTo, `Redirecting to ${normalizedRole.replace('ROLE_', '').toLowerCase()} dashboard...`);
      return;
    }
  }
}
