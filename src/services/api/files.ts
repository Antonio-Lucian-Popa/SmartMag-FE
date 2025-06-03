import { api } from './index';
import { FileEntity } from '@/types';

export const uploadFile = async (
  file: File, 
  entityType: string, 
  entityId: string
): Promise<FileEntity> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  
  const response = await api.post<FileEntity>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getFilesByEntity = async (
  entityType: string, 
  entityId: string
): Promise<FileEntity[]> => {
  const response = await api.get<FileEntity[]>(`/files?entityType=${entityType}&entityId=${entityId}`);
  return response.data;
};

export const deleteFile = async (
  fileId: string, 
  entityType: string, 
  entityId: string
): Promise<void> => {
  await api.delete(`/files?fileId=${fileId}&entityType=${entityType}&entityId=${entityId}`);
};