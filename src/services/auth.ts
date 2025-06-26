import api from '../lib/axios';

export const requestOtp = async (phone: string) => {
  const { data } = await api.post('/auth/request-otp', { phone });
  return data;
};

export const verifyOtp = async ({ phone, otp }: { phone: string; otp: string }) => {
  const { data } = await api.post('/auth/verify-otp', { phone, otp });
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};
