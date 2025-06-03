import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = '/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a function that sets up axios interceptors with auth context
export const setupAxiosInterceptors = (
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>,
  logout: () => void
) => {
  let isRefreshing = false;
  let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

  const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach(prom => {
      if (token) {
        prom.resolve(token);
      } else {
        prom.reject(error);
      }
    });
    failedQueue = [];
  };

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      if (!originalRequest) return Promise.reject(error);

      // If the error is not 401 or the request already tried to refresh, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Mark this request as retried
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          isRefreshing = false;
          
          if (newToken) {
            // Update header for the original request
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = { 'Authorization': `Bearer ${newToken}` };
            }
            
            // Process the queue with the new token
            processQueue(null, newToken);
            
            // Retry the original request
            return api(originalRequest);
          } else {
            // Token refresh failed
            processQueue(error, null);
            logout();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              } else {
                originalRequest.headers = { 'Authorization': `Bearer ${token}` };
              }
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }
    }
  );
};

// Custom hook to use the API with auth
export const useApi = () => {
  const { accessToken, refreshToken: refreshTokenFn, logout } = useAuth();
  
  // Set up interceptors
  setupAxiosInterceptors(
    () => accessToken,
    refreshTokenFn,
    logout
  );
  
  return api;
};