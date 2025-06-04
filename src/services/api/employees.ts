import { api } from './index';
import { User, UserRole } from '@/types';

interface CreateEmployeeDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string;
}

interface UpdateEmployeeDto {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  storeId?: string;
}

export const createEmployee = async (employeeData: CreateEmployeeDto): Promise<User> => {
  const response = await api.post<User>('/employee', employeeData);
  return response.data;
};

export const getEmployeesByCompany = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/employee/by-company');
  return response.data;
};

export const updateEmployee = async (employeeData: UpdateEmployeeDto): Promise<User> => {
  const response = await api.put<User>(`/employee/${employeeData.id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await api.delete(`/employee/${id}`);
};