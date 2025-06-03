import { api } from './index';
import { Shift, ShiftSwapRequest } from '@/types';

interface CreateShiftDto {
  storeId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
}

interface ShiftConfirmationDto {
  shiftId: string;
  status: 'CONFIRMED' | 'MISSED';
}

interface CreateShiftSwapDto {
  requesterShiftId: string;
  requesteeId: string;
  requesteeShiftId?: string;
}

interface UpdateShiftSwapDto {
  requestId: string;
  status: 'APPROVED' | 'REJECTED';
}

export const getMySchedule = async (): Promise<Shift[]> => {
  const response = await api.get<Shift[]>('/shifts/my-schedule');
  return response.data;
};

export const createShift = async (shiftData: CreateShiftDto): Promise<Shift> => {
  const response = await api.post<Shift>('/shifts', shiftData);
  return response.data;
};

export const confirmShift = async (confirmationData: ShiftConfirmationDto): Promise<Shift> => {
  const response = await api.put<Shift>('/shifts/confirm', confirmationData);
  return response.data;
};

export const createShiftSwap = async (swapData: CreateShiftSwapDto): Promise<ShiftSwapRequest> => {
  const response = await api.post<ShiftSwapRequest>('/shift-swap', swapData);
  return response.data;
};

export const updateShiftSwap = async (updateData: UpdateShiftSwapDto): Promise<ShiftSwapRequest> => {
  const response = await api.put<ShiftSwapRequest>('/shift-swap/approve', updateData);
  return response.data;
};

export const getMySwapRequests = async (): Promise<ShiftSwapRequest[]> => {
  const response = await api.get<ShiftSwapRequest[]>('/shift-swap/my-requests');
  return response.data;
};