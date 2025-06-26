import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { AuthProvider } from './providers/AuthProvider';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
