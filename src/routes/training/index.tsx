import { Login } from '@/domains/auth/pages/Login'
import { createFileRoute } from '@tanstack/react-router'
import { useAuthCheck } from '@/utils/useAuthCheck'

export const Route = createFileRoute('/training/')({ 
  beforeLoad: ({ location }) => {
    useAuthCheck(location.pathname)
  },

  component: Login,
})
