import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useUser = () => {
  return useQuery(['user'], async () => {
    const { data } = await api.get('/user');
    return data;
  });
};
