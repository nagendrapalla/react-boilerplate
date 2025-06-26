import { TutorHome } from '@/domains/tutor-home-page'
import { createFileRoute } from '@tanstack/react-router'
import { useAuthCheck } from '@/utils/useAuthCheck'
import { useStorePath } from '@/shared/hooks/useStorePath'

export const Route = createFileRoute('/training/tutor/')({  
  component: RouteComponent,
  beforeLoad: ({ location, context }) => {
    // Store the current path before loading the component
    // This will be used for redirects if a user tries to access a restricted page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPath', '/training/tutor');
    }
    
    useAuthCheck(location.pathname)
    return context;
  },
})

function RouteComponent() {
  // Store the current path for redirects
  useStorePath();
  
  return <TutorHome />
}
