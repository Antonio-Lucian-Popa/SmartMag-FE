import { api } from './index';
import { Store } from '@/types';

interface CreateStoreDto {
  name: string;
  address: string;
  managerId?: string;
}

export const createStore = async (storeData: CreateStoreDto): Promise<Store> => {
  const response = await api.post<Store>('/store', storeData);
  return response.data;
};

export const getStoresByCompany = async (): Promise<Store[]> => {
  const response = await api.get<Store[]>('/store/by-company');
  return response.data;
};

export const deleteStore = async (id: string): Promise<void> => {
  await api.delete(`/store/${id}`);
};