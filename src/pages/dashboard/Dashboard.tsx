import React from 'react';
import { useUser } from '../../hooks/useUser';

const Dashboard: React.FC = () => {
  const { data: user } = useUser();
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;
