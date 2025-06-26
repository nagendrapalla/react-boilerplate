import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence } from 'framer-motion'
import { SlideTransition } from '@/shared/components/motion/transitions'
import { Button } from 'ti-react-template/components'
import { LogOutIcon } from 'lucide-react'
import { globalLogout } from '@/domains/auth/store/authAtom'
import { useAuthCheck } from '@/utils/useAuthCheck'

export const Route = createFileRoute('/training/tutor/_layout')({
  beforeLoad: ({ location }) => {
    useAuthCheck(location.pathname)
  },
  component: TutorLayout,
})

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}

function TutorLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* This header will always stay visible */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Tutor Dashboard</h1>
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
        <ErrorBoundary
          fallback={<div className="text-red-500">Something went wrong</div>}
        >
          {/* Only this part changes when navigating between courses */}
          <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
            <Suspense fallback={<LoadingSpinner />}>
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
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}
