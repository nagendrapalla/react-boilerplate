import React from 'react';
import { Outlet } from '@tanstack/react-router';

const PublicLayout: React.FC = () => (
  <div>
    <Outlet />
  </div>
);

export default PublicLayout;
