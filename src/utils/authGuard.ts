import { getCookie } from '@/shared/utlis/cookieUtils'
import { getItem } from '@/shared/utlis/localStorage'
import { redirectByRole } from '@/shared/utlis/routeUtils'
import { getPreviousPath, showLoadingAndRedirect, storeCurrentPath } from '@/shared/utlis/authUtils'
import { useAuthCheck } from './useAuthCheck'

/**
 * Checks if a path should be accessible by both students and instructors
 * @param pathname The path to check
 * @returns boolean indicating if instructors should be able to access this student path
 */
function isSharedRoute(pathname: string): boolean {
  // Check for the topics route pattern
  if (pathname.match(/\/training\/student\/all-courses\/[\w-]+\/topics(\/?|\/.*)$/)) {
    console.log(`[authGuardCheck] Shared route match found for ${pathname}`);
    return true;
  }
  return false;
}

/**
 * Checks if the user is authenticated and has the correct role to access a route
 * @param param0 The route context with location from TanStack Router
 * @param requiredRoles The specific roles required to access this route, or null if any authenticated user can access
 */
export async function authGuardCheck({ location }: { location: { pathname: string } }, requiredRoles?: string | string[]) {
  // Get the current path to be able to redirect back if needed
  const currentPath = location.pathname
  console.log(`[authGuardCheck] Called for path: ${currentPath}`)
  
  // First check for token before any rendering happens
  const accessToken = getCookie('access_token')
  if (!accessToken) {
    console.log(`[authGuardCheck] No token found, redirecting to login`)
    // If no token, show loading and redirect immediately
    // We don't store the path here as we want an unauthenticated user to land on the login page
    return showLoadingAndRedirect('/training', 'Redirecting to login page...')
  }
  
  // If no roles are required, allow access
  if (!requiredRoles) {
    console.log(`[authGuardCheck] No role required, allowing access`)
    // Store the current valid path - this ensures if they try to access a role-restricted route 
    // later, they'll be redirected back to this valid path
    storeCurrentPath(currentPath)
    useAuthCheck(location.pathname)
    return {}
  }
  
  // Get the user's role from localStorage
  const userRole = getItem('role') as string
  console.log(`[authGuardCheck] User role from localStorage: '${userRole}'`)
  
  // If the user has no role, redirect to the login page
  if (!userRole) {
    console.log(`[authGuardCheck] No role found, redirecting to login`)
    return showLoadingAndRedirect('/training', 'Redirecting to login page...')
  }
  
  // Convert requiredRoles to array for consistent handling
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  console.log(`[authGuardCheck] Required roles: [${roles.join(', ')}]`)
  
  // Special handling for instructor accessing shared student routes
  // This is needed because the URL structure includes /student/ but should be accessible by instructors
  if (userRole === 'ROLE_Instructor' && 
      roles.includes('ROLE_Instructor') && 
      roles.includes('ROLE_Student') && 
      isSharedRoute(currentPath)) {
    console.log(`[authGuardCheck] Allowing instructor to access shared student route: ${currentPath}`);
    storeCurrentPath(currentPath);
    useAuthCheck(location.pathname)
    return {};
  }
  
  // Check if the user's role is included in the allowed roles
  if (roles.includes(userRole)) {
    console.log(`[authGuardCheck] Role match found: ${userRole} is allowed`)
    // If all checks pass, allow access
    // Store the current valid path - this ensures if they try to access a role-restricted route 
    // later, they'll be redirected back to this valid path
    storeCurrentPath(currentPath)
    useAuthCheck(location.pathname)
    return {}
  }
  
  // If we get here, the user is not authorized for this route
  console.log(`[authGuardCheck] Role mismatch: user has ${userRole}, but one of [${roles.join(", ")}] is required`)
  
  // Store the current path before redirecting
  storeCurrentPath(location.pathname)
  
  // Get the user's appropriate dashboard path based on their role
  const userDashboardPath = redirectByRole(userRole)
  console.log(`[authGuardCheck] Dashboard path for role ${userRole}: ${userDashboardPath}`)
  
  // Get the previous path or use the default based on role
  const redirectTo = getPreviousPath(userDashboardPath)
  console.log(`[authGuardCheck] Redirecting to: ${redirectTo}`)
  
  // Redirect to the appropriate page
  return showLoadingAndRedirect(redirectTo, `Redirecting to ${userRole.replace('ROLE_', '').toLowerCase()} dashboard...`)
}
