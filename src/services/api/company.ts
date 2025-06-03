import { api } from './index';
import { Company } from '@/types';

export const createCompany = async (name: string, cui: string): Promise<Company> => {
  const response = await api.post<Company>('/company', { name, cui });
  return response.data;
};

export const getCurrentCompany = async (): Promise<Company> => {
  const response = await api.get<Company>('/company/me');
  return response.data;
};

export const updateCompany = async (name: string, cui: string): Promise<Company> => {
  const response = await api.put<Company>('/company', { name, cui });
  return response.data;
};

export const deleteCompany = async (): Promise<void> => {
  await api.delete('/company');
};