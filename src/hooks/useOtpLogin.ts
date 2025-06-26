import { useMutation } from '@tanstack/react-query';
import * as authService from '../services/auth';

export const useOtpLogin = () => {
  const requestOtp = useMutation(authService.requestOtp);
  const verifyOtp = useMutation(authService.verifyOtp);

  return {
    requestOtp: requestOtp.mutateAsync,
    verifyOtp: verifyOtp.mutateAsync,
  };
};
