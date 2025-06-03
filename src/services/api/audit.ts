import { api } from './index';
import { AuditLog } from '@/types';

export const getCompanyAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>('/audit/company');
  return response.data;
};

export const getUserAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>('/audit/user');
  return response.data;
};