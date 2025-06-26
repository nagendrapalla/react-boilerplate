import { StudentHomePage } from '@/domains/student-home-page'
import { createFileRoute } from '@tanstack/react-router'
import { authGuardCheck } from '@/utils/authGuard'
import { useStorePath } from '@/hooks/useStorePath'

export const Route = createFileRoute('/training/student/')({
  beforeLoad: (args) => {
    // Use the reusable auth guard with specific role requirement
    authGuardCheck(args, 'ROLE_Student')
  },
  component: StudentRoute,
})

function StudentRoute() {
  // Store this path so we can redirect back to it if needed
  useStorePath()
  
  return <StudentHomePage />
}
