import { api } from './index';
import { AttendanceLog } from '@/types';

export const checkIn = async (): Promise<AttendanceLog> => {
  const response = await api.post<AttendanceLog>('/attendance/check-in');
  return response.data;
};

export const checkOut = async (): Promise<AttendanceLog> => {
  const response = await api.post<AttendanceLog>('/attendance/check-out');
  return response.data;
};

export const getMyAttendanceLogs = async (): Promise<AttendanceLog[]> => {
  const response = await api.get<AttendanceLog[]>('/attendance/my-logs');
  return response.data;
};