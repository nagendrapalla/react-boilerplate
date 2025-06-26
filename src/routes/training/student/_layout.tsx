import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SlideTransition } from '@/shared/components/motion/transitions'
import { RouteErrorBoundary } from '@/error/RouteErrorBoundary'
import { Button, GlobalLoader } from 'ti-react-template/components'
import { useAuthCheck } from '@/utils/useAuthCheck'
import { LogOutIcon } from 'lucide-react'
import { globalLogout } from '@/domains/auth/store/authAtom'
import { getCookie } from '@/shared/utlis/cookieUtils'
import { getItem } from '@/shared/utlis/localStorage'
import { redirectByRole } from '@/shared/utlis/routeUtils'
import { getPreviousPath, showLoadingAndRedirect } from '@/shared/utlis/authUtils'

export const Route = createFileRoute('/training/student/_layout')({  
  beforeLoad: ({ location }) => {
    // First check for token before any rendering happens
    const accessToken = getCookie('access_token')
    if (!accessToken) {
      // If no token, show loading and redirect immediately
      showLoadingAndRedirect('/training', 'Redirecting to login page...')
      return
    }
    
    // Check for role authorization
    const userRole = getItem('role') as string
    if (userRole && userRole !== 'ROLE_Student') {
      console.log(`Unauthorized role access attempt: ${userRole} trying to access student page`)
      
      // Get the previous path or use the role-based redirect as fallback
      const redirectPath = getPreviousPath(redirectByRole(userRole))
      
      // Show loading and redirect
      showLoadingAndRedirect(redirectPath, `Redirecting to ${userRole.replace('ROLE_', '').toLowerCase()} dashboard...`)
      return
    }
    
    // If token exists and role is correct, proceed with normal auth check
    useAuthCheck(location.pathname)
  },
  component: StudentLayout,
})

function StudentLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* This header will always stay visible */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Student Dashboard</h1>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={globalLogout}
          >
            <LogOutIcon size={18} />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RouteErrorBoundary>
          <Suspense fallback={<GlobalLoader />}>
            <AnimatePresence mode="wait" initial={false}>
              <SlideTransition
                key={location.pathname}
                direction={
                  location.pathname.includes('courses') ? 'left' : 'right'
                }
                className="w-full"
              >
                <Outlet />
              </SlideTransition>
            </AnimatePresence>
          </Suspense>
        </RouteErrorBoundary>
      </div>
    </div>
  )
}
