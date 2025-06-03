import { api } from './index';
import { User } from '@/types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<void> => {
  await api.post('/auth/register', { email, password, firstName, lastName });
};

export const refreshToken = async (token: string): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>('/auth/refresh', { token });
  return response.data;
};