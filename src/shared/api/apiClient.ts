import axios, { type AxiosRequestConfig } from 'axios';
import { getAccessToken } from '../utlis/cookieUtils';
import { globalLogout } from '@/domains/auth/store/authAtom';
import { getItem } from '../utlis/localStorage';

const instance = axios.create({
  baseURL:process.env.VITE_API_URL,
  withCredentials: true,
  validateStatus: () => true,
});


// Wait for new access token
const waitForNewAccessToken = async (oldToken: string | null): Promise<string | null> => {
  const maxAttempts = 10;
  const delayMs = 500;

  for (let i = 0; i < maxAttempts; i++) {
    const newToken = getAccessToken();
    if (newToken && newToken !== oldToken) {
      return newToken;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return null;
};

// Check if user has any auth data in localStorage
const hasAuthDataInLocalStorage = (): boolean => {
  return !!getItem('role') || !!getItem('userId') || !!getItem('userName');
};

instance.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  response => {
    // Check for unauthorized error in response data
    if (response.status === 401 || 
        (response.data && 
         typeof response.data === 'object' && 
         response.data.error === 'Unauthorized')) {
         
      // Only redirect to login if we have auth data in localStorage
      // This prevents redirect during login attempts with wrong credentials
      if (hasAuthDataInLocalStorage()) {
        console.log('Unauthorized response detected with existing auth data, redirecting to login page');
        globalLogout();
        return Promise.reject(new Error('Unauthorized'));
      }
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If we have auth data in localStorage, try to refresh token and redirect if that fails
      if (hasAuthDataInLocalStorage()) {
        // Get current token before waiting
        const oldToken = getAccessToken();
        
        // Wait for server to update the access token cookie
        const newToken = await waitForNewAccessToken(oldToken);
        
        if (newToken) {
          // Retry the request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } else {
          // If no new token received after max attempts, redirect to login using globalLogout
          console.log('No new token received, redirecting to login page');
          globalLogout();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const getAxios = async (apiPath: string, params?: unknown) => {
  // @TODO: Check validity of params
  return instance.get(apiPath, {
    params,
  });
};

export const postAxios = async (
  apiPath: string,
  data: unknown,
  config?: AxiosRequestConfig<unknown>
) => {
  return instance.post(apiPath, data, config);
};

export const patchAxios = async (
  apiPath: string,
  data: unknown,
  config?: AxiosRequestConfig<unknown>
) => {
  return instance.patch(apiPath, data, config);
};

export const deleteAxios = async (apiPath: string) => {
  return instance.delete(apiPath);
};

export const putAxios = async (
  apiPath: string,
  data: unknown,
  config?: AxiosRequestConfig<unknown>
) => {
  return instance.put(apiPath, data, config);
};
