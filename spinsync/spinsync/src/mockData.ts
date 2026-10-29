import { User, DualMachine, TimeSlot, Booking, WalletTransaction } from './types';

export const MOCK_USERS: User[] = [
  { id: 'usr-1', name: 'Alex Johnson', roomNumber: 'Room 204', avatar: '👨‍🎓', role: 'student', email: 'alex@student.edu' },
  { id: 'usr-2', name: 'Sarah Miller', roomNumber: 'Room 305', avatar: '👩‍🎓', role: 'student', email: 'sarah@student.edu' },
  { id: 'usr-3', name: 'David Chen', roomNumber: 'Room 112', avatar: '🧑‍💻', role: 'student', email: 'david@student.edu' },
  { id: 'usr-admin', name: 'Facility Admin (Manager)', roomNumber: 'Admin Office', avatar: '🔑', role: 'admin', email: 'admin@spinsync.com' },
];

export const PRICING_CONFIG = {
  pricePerCloth: 5.0, // ₹5 per cloth washing
  ironingPricePerCloth: 5.0, // ₹5 per cloth ironing
  hotWaterFlatPrice: 5.0, // ₹5 extra for hot water option
};

export const INITIAL_WALLETS: Record<string, number> = {
  'usr-1': 150.0, // Alex Johnson (₹150)
  'usr-2': 100.0, // Sarah Miller (₹100)
  'usr-3': 120.0, // David Chen (₹120)
  'usr-admin': 500.0, // Admin Revenue Wallet (₹500)
};

export const DUAL_MACHINES: DualMachine[] = [
  {
    id: 'mach-1',
    name: 'Dual Combo Unit D-101',
    capacity: '10 kg Wash + 7 kg Steam Dry',
    status: 'available',
  },
  {
    id: 'mach-2',
    name: 'Dual Combo Unit D-102',
    capacity: '10 kg Wash + 7 kg Steam Dry',
    status: 'available',
  },
  {
    id: 'mach-3',
    name: 'Dual Combo Unit D-103',
    capacity: '12 kg Heavy Duty Wash+Dry',
    status: 'available',
  },
  {
    id: 'mach-4',
    name: 'Dual Combo Unit D-104',
    capacity: '10 kg Wash + 7 kg Steam Dry',
    status: 'available',
  },
  {
    id: 'mach-5',
    name: 'Dual Combo Unit D-105',
    capacity: '10 kg Wash + 7 kg Steam Dry',
    status: 'maintenance',
  },
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-8', label: '08:00 AM - 09:00 AM', startHour: 8 },
  { id: 'slot-9', label: '09:00 AM - 10:00 AM', startHour: 9 },
  { id: 'slot-10', label: '10:00 AM - 11:00 AM', startHour: 10, isPeak: true },
  { id: 'slot-11', label: '11:00 AM - 12:00 PM', startHour: 11, isPeak: true },
  { id: 'slot-12', label: '12:00 PM - 01:00 PM', startHour: 12 },
  { id: 'slot-13', label: '01:00 PM - 02:00 PM', startHour: 13 },
  { id: 'slot-14', label: '02:00 PM - 03:00 PM', startHour: 14 },
  { id: 'slot-15', label: '03:00 PM - 04:00 PM', startHour: 15 },
  { id: 'slot-16', label: '04:00 PM - 05:00 PM', startHour: 16, isPeak: true },
  { id: 'slot-17', label: '05:00 PM - 06:00 PM', startHour: 17, isPeak: true },
  { id: 'slot-18', label: '06:00 PM - 07:00 PM', startHour: 18, isPeak: true },
  { id: 'slot-19', label: '07:00 PM - 08:00 PM', startHour: 19, isPeak: true },
  { id: 'slot-20', label: '08:00 PM - 09:00 PM', startHour: 20 },
  { id: 'slot-21', label: '09:00 PM - 10:00 PM', startHour: 21 },
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-init-1',
    userId: 'usr-1',
    userName: 'Alex Johnson',
    type: 'recharge',
    amount: 150.0,
    description: 'Initial Wallet Balance',
    date: today,
    time: '08:00 AM',
  },
  {
    id: 'tx-init-2',
    userId: 'usr-admin',
    userName: 'Facility Admin',
    type: 'admin_revenue',
    amount: 500.0,
    description: 'Opening Facility Revenue Balance',
    date: today,
    time: '08:00 AM',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    userId: 'usr-2', // Sarah Miller
    userName: 'Sarah Miller',
    userRoom: 'Room 305',
    machineId: 'mach-1',
    machineName: 'Dual Combo Unit D-101',
    date: today,
    slotId: 'slot-10',
    slotLabel: '10:00 AM - 11:00 AM',
    status: 'booked_waiting_approval',
    bookedAt: '09:30 AM',
    clothesCount: 6,
    waterTemperature: 'cold',
    includeIroning: true,
    washPrice: 30.0,
    tempPrice: 0.0,
    ironingPrice: 30.0,
    totalPrice: 60.0,
    paymentStatus: 'pending',
  },
  {
    id: 'bk-102',
    userId: 'usr-3', // David Chen
    userName: 'David Chen',
    userRoom: 'Room 112',
    machineId: 'mach-2',
    machineName: 'Dual Combo Unit D-102',
    date: today,
    slotId: 'slot-14',
    slotLabel: '02:00 PM - 03:00 PM',
    status: 'approved',
    bookedAt: '10:15 AM',
    approvedAt: '10:20 AM',
    clothesCount: 8,
    waterTemperature: 'hot',
    includeIroning: false,
    washPrice: 40.0,
    tempPrice: 5.0,
    ironingPrice: 0.0,
    totalPrice: 45.0,
    paymentStatus: 'paid',
  },
];
