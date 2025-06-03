export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  storeId?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Company {
  id: string;
  name: string;
  cui: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  companyId: string;
  managerId?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  sgr?: boolean;
  companyId: string;
}

export interface Stock {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  updatedAt: string;
}

export interface StockWithProduct extends Stock {
  product: Product;
}

export interface Shift {
  id: string;
  storeId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'MISSED';
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesteeId: string;
  requesterShiftId: string;
  requesteeShiftId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  storeId: string;
  checkInTime?: string;
  checkOutTime?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
}

export interface FileEntity {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  entityType: 'COMPANY' | 'STORE' | 'PRODUCT' | 'USER' | 'TIMEOFF';
  entityId: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}