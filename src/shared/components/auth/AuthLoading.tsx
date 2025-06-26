import { useEffect, useState } from 'react';
import { GlobalLoader } from 'ti-react-template/components';

interface AuthLoadingProps {
  message?: string;
  redirectDelay?: number;
  onComplete?: () => void;
}

export function AuthLoading({
  message = 'Checking authentication...',
  redirectDelay = 1000,
  onComplete
}: AuthLoadingProps): JSX.Element {
  const [dots, setDots] = useState('.');

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Call onComplete after delay
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [onComplete, redirectDelay]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50">
      <GlobalLoader />
      <p className="mt-4 text-lg font-medium text-gray-700">
        {message}{dots}
      </p>
    </div>
  );
}
