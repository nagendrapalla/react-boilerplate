/**
 * Utility functions for authentication and authorization
 */

/**
 * Shows a loading overlay and redirects to the specified path
 * @param redirectPath The path to redirect to
 * @param message The message to display during loading
 */
export function showLoadingAndRedirect(redirectPath: string, message: string = 'Redirecting...') {
  // Create a loading element
  const loadingContainer = document.createElement('div')
  loadingContainer.id = 'auth-loading-container'
  loadingContainer.style.position = 'fixed'
  loadingContainer.style.top = '0'
  loadingContainer.style.left = '0'
  loadingContainer.style.width = '100%'
  loadingContainer.style.height = '100%'
  loadingContainer.style.backgroundColor = 'white'
  loadingContainer.style.display = 'flex'
  loadingContainer.style.flexDirection = 'column'
  loadingContainer.style.alignItems = 'center'
  loadingContainer.style.justifyContent = 'center'
  loadingContainer.style.zIndex = '9999'
  
  // Add loading spinner
  const spinner = document.createElement('div')
  spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)'
  spinner.style.borderLeft = '4px solid #3b82f6'
  spinner.style.borderRadius = '50%'
  spinner.style.width = '50px'
  spinner.style.height = '50px'
  spinner.style.animation = 'spin 1s linear infinite'
  
  // Add loading text
  const loadingText = document.createElement('p')
  loadingText.textContent = message
  loadingText.style.marginTop = '16px'
  loadingText.style.fontSize = '16px'
  loadingText.style.fontWeight = '500'
  loadingText.style.color = '#4b5563'
  
  // Add animation style
  const style = document.createElement('style')
  style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
  
  // Append elements
  loadingContainer.appendChild(spinner)
  loadingContainer.appendChild(loadingText)
  document.head.appendChild(style)
  document.body.appendChild(loadingContainer)
  
  // Redirect immediately
  window.location.href = redirectPath
}

/**
 * Checks if the user has the required role
 * @param requiredRole The role required to access the route
 * @returns True if the user has the required role, false otherwise
 */
export function checkUserRole(requiredRole: string): boolean {
  const userRole = localStorage.getItem('role')
  return userRole === requiredRole
}

/**
 * Gets the previous path from the referrer or session storage
 * @param fallbackPath The fallback path to use if no previous path is found
 * @returns The previous path or the fallback path
 */
export function getPreviousPath(fallbackPath: string): string {
  // Try to get the path from session storage first
  const storedPath = sessionStorage.getItem('previousPath');
  if (storedPath && storedPath.startsWith('/training')) {
    // Clear the stored path to avoid reusing it multiple times
    sessionStorage.removeItem('previousPath');
    return storedPath;
  }
  
  // Try to get the path from the referrer
  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      // Only use the referrer if it's from the same origin and is a valid training path
      if (referrerUrl.origin === window.location.origin && referrerUrl.pathname.startsWith('/training')) {
        return referrerUrl.pathname;
      }
    } catch (error) {
      console.error('Error parsing referrer URL:', error);
    }
  }
  
  // If no valid referrer or stored path, return the fallback path
  return fallbackPath;
}

/**
 * Stores the current path in session storage for later use
 * This should be called before navigating away from a page
 * @param customPath Optional path to store instead of the current window location
 */
export function storeCurrentPath(customPath?: string): void {
  const pathToStore = customPath || window.location.pathname;
  if (pathToStore.startsWith('/training')) {
    sessionStorage.setItem('previousPath', pathToStore);
  }
}
