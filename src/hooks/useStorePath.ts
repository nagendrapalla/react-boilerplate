import { useEffect } from 'react'
import { storeCurrentPath } from '@/shared/utlis/authUtils'

/**
 * A hook that stores the current path in session storage when a component mounts
 * This helps preserve navigation history for role-based redirects
 */
export function useStorePath(): void {
  useEffect(() => {
    // Store the current path when the component mounts
    storeCurrentPath()
  }, [])
}
