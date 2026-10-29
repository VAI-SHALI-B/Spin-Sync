export type UserRole = 'student' | 'admin';

export type WaterTemperature = 'cold' | 'hot';

export interface User {
  id: string;
  name: string;
  roomNumber: string;
  avatar: string;
  role: UserRole;
  email: string;
}

export interface DualMachine {
  id: string;
  name: string;
  capacity: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export interface TimeSlot {
  id: string;
  label: string;
  startHour: number;
  isPeak?: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'recharge' | 'wash_payment' | 'refund' | 'admin_revenue';
  amount: number;
  description: string;
  date: string;
  time: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userRoom: string;
  machineId: string;
  machineName: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  slotLabel: string;
  status: 'booked_waiting_approval' | 'approved' | 'finished' | 'cancelled';
  bookedAt: string;
  approvedAt?: string;
  finishedAt?: string;
  // Wash & Ironing specifications
  clothesCount: number;
  waterTemperature: WaterTemperature;
  includeIroning: boolean;
  washPrice: number;
  ironingPrice: number;
  tempPrice: number;
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

