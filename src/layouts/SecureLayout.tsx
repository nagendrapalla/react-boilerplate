import React from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../providers/AuthProvider';

const SecureLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate({ to: '/login' });
    }
  }, [user, navigate]);

  return <Outlet />;
};

export default SecureLayout;
