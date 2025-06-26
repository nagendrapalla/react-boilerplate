import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh logic placeholder
      // e.g., await refreshToken();
    }
    return Promise.reject(error);
  }
);

export default api;
