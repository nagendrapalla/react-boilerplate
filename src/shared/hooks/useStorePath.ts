import { useEffect } from 'react';
import { storeCurrentPath } from '@/shared/utlis/authUtils';

/**
 * Hook that stores the current path in session storage when the component mounts
 * This is useful for preserving navigation history for redirects
 */
export function useStorePath(): void {
  useEffect(() => {
    // Store the current path when the component mounts
    storeCurrentPath();
  }, []);
}
