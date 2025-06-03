import { api } from './index';
import { TimeOffRequest } from '@/types';

interface CreateTimeOffDto {
  startDate: string;
  endDate: string;
  reason: string;
}

interface UpdateTimeOffDto {
  requestId: string;
  status: 'APPROVED' | 'REJECTED';
}

export const createTimeOffRequest = async (timeOffData: CreateTimeOffDto): Promise<TimeOffRequest> => {
  const response = await api.post<TimeOffRequest>('/time-off', timeOffData);
  return response.data;
};

export const approveOrRejectTimeOff = async (updateData: UpdateTimeOffDto): Promise<TimeOffRequest> => {
  const response = await api.put<TimeOffRequest>('/time-off/approve', updateData);
  return response.data;
};

export const getMyTimeOffRequests = async (): Promise<TimeOffRequest[]> => {
  const response = await api.get<TimeOffRequest[]>('/time-off/my');
  return response.data;
};