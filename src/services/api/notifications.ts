import { api } from './index';
import { Notification } from '@/types';

export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>('/notifications/my');
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/mark-as-read/${id}`);
};