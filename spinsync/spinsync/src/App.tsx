import React, { useState, useEffect } from 'react';
import {
  WashingMachine,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info,
  LogOut,
  UserCheck,
  Lock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Check,
  X,
  Play,
  Wallet,
  Plus,
  Wrench,
  Flame,
  Droplets,
  Shirt,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  KeyRound,
  Shield,
  CreditCard,
} from 'lucide-react';
import { User, DualMachine, Booking, WaterTemperature, WalletTransaction } from './types';
import {
  MOCK_USERS,
  DUAL_MACHINES,
  TIME_SLOTS,
  INITIAL_BOOKINGS,
  INITIAL_WALLETS,
  INITIAL_TRANSACTIONS,
  PRICING_CONFIG,
} from './mockData';

const DB_BOOKINGS_KEY = 'spinsync_db_bookings_v6';
const DB_USER_KEY = 'spinsync_db_user_v6';
const DB_MACHINES_KEY = 'spinsync_db_machines_v6';
const DB_WALLETS_KEY = 'spinsync_db_wallets_v6';
const DB_TRANSACTIONS_KEY = 'spinsync_db_transactions_v6';

const formatLocalDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function App() {
  const todayLocalDateStr = formatLocalDate(new Date());

  // Persistent Auth State
  const [authUser, setAuthUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(DB_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistent Machines State
  const [machines, setMachines] = useState<DualMachine[]>(() => {
    try {
      const saved = localStorage.getItem(DB_MACHINES_KEY);
      return saved ? JSON.parse(saved) : DUAL_MACHINES;
    } catch {
      return DUAL_MACHINES;
    }
  });

  // Persistent Bookings Database State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(DB_BOOKINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  // Persistent Wallets Database State
  const [wallets, setWallets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(DB_WALLETS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WALLETS;
    } catch {
      return INITIAL_WALLETS;
    }
  });

  // Persistent Wallet Transactions Database State
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(DB_TRANSACTIONS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(todayLocalDateStr);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(DB_BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_MACHINES_KEY, JSON.stringify(machines));
    } catch (e) {
      console.error('Failed to save machines', e);
    }
  }, [machines]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_WALLETS_KEY, JSON.stringify(wallets));
    } catch (e) {
      console.error('Failed to save wallets', e);
    }
  }, [wallets]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem(DB_USER_KEY, JSON.stringify(authUser));
      } else {
        localStorage.removeItem(DB_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  }, [authUser]);

  // Modal Alert State (Ongoing wash restriction)
  const [alertModal, setAlertModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    existingBooking?: Booking;
  }>({ show: false, title: '', message: '' });

  // Student Booking Customization Modal State
  const [bookingModal, setBookingModal] = useState<{
    show: boolean;
    machine: DualMachine | null;
    slotId: string;
    slotLabel: string;
    clothesCount: number;
    waterTemperature: WaterTemperature;
    includeIroning: boolean;
  }>({
    show: false,
    machine: null,
    slotId: '',
    slotLabel: '',
    clothesCount: 5,
    waterTemperature: 'cold',
    includeIroning: false,
  });

  // Admin Add Machine Modal State
  const [addMachineModal, setAddMachineModal] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineCapacity, setNewMachineCapacity] = useState('10 kg Wash + 7 kg Steam Dry');
  const [newMachineStatus, setNewMachineStatus] = useState<'available' | 'maintenance'>('available');

  // Student Wallet OTP Recharge Modal State
  const [showStudentWalletModal, setShowStudentWalletModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'amount' | 'otp' | 'success'>('amount');
  const [rechargeAmount, setRechargeAmount] = useState<number>(100);
  const [rechargeCustomInput, setRechargeCustomInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [mobileNumber, setMobileNumber] = useState<string>('9876543210');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Admin Wallet Modal State
  const [showAdminWalletModal, setShowAdminWalletModal] = useState(false);

  // Admin Machine Management Section toggle
  const [showMachineManagementSection, setShowMachineManagementSection] = useState(false);

  // Toast State
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Price Calculation Helper (Washing ₹5/cloth, Ironing ₹5/cloth)
  const calculatePrice = (
    clothesCount: number,
    waterTemperature: WaterTemperature,
    includeIroning: boolean
  ) => {
    const washPrice = clothesCount * PRICING_CONFIG.pricePerCloth;
    const tempPrice = waterTemperature === 'hot' ? PRICING_CONFIG.hotWaterFlatPrice : 0;
    const ironingPrice = includeIroning ? clothesCount * PRICING_CONFIG.ironingPricePerCloth : 0;
    const totalPrice = washPrice + tempPrice + ironingPrice;
    return { washPrice, tempPrice, ironingPrice, totalPrice };
  };

  // Next 7 Days Generator
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = formatLocalDate(d);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDisplay = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      days.push({ isoDate, dayName, formattedDate, fullDisplay, isToday: i === 0 });
    }
    return days;
  };

  const next7Days = getNext7Days();
  const minDate = next7Days[0].isoDate;
  const maxDate = next7Days[6].isoDate;

  const currentSelectedDayInfo = next7Days.find((d) => d.isoDate === selectedDate) || {
    fullDisplay: new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  };

  // Check if student has ANY active unfinished wash
  const getStudentUnfinishedWash = (userId: string) => {
    return bookings.find(
      (b) =>
        b.userId === userId &&
        (b.status === 'booked_waiting_approval' || b.status === 'approved')
    );
  };

  const studentWalletBalance = authUser ? wallets[authUser.id] ?? 0 : 0;
  const adminRevenueBalance = wallets['usr-admin'] ?? 0;

  // Student clicks "Book Slot" to open customization modal
  const handleStudentInitiateBooking = (machine: DualMachine, slotId: string, slotLabel: string) => {
    if (!authUser) return;

    if (authUser.role === 'admin') {
      showToast('info', 'Admin Mode: Slot booking is disabled for Admin accounts.');
      return;
    }

    if (machine.status === 'maintenance') {
      showToast('error', `${machine.name} is currently under maintenance.`);
      return;
    }

    // Check if slot is occupied on selected date
    const slotOccupied = bookings.find(
      (b) =>
        b.machineId === machine.id &&
        b.date === selectedDate &&
        b.slotId === slotId &&
        (b.status === 'booked_waiting_approval' || b.status === 'approved')
    );

    if (slotOccupied) {
      if (slotOccupied.userId === authUser.id) {
        showToast('info', 'You have already booked this slot!');
      } else {
        showToast(
          'error',
          `This slot is reserved for ${slotOccupied.userName} (${slotOccupied.userRoom}).`
        );
      }
      return;
    }

    // STRICT UNFINISHED WASH RULE
    const activeUnfinishedWash = getStudentUnfinishedWash(authUser.id);
    if (activeUnfinishedWash) {
      setAlertModal({
        show: true,
        title: 'Booking Blocked - Ongoing Wash in Progress',
        message: `${authUser.name} has an active wash booking (${activeUnfinishedWash.machineName} on ${activeUnfinishedWash.date} at ${activeUnfinishedWash.slotLabel}) that is currently ${activeUnfinishedWash.status === 'approved' ? 'Approved & Running' : 'Waiting for Approval'}. You can only submit a new laundry booking after your current wash is marked as Finished by the Admin.`,
        existingBooking: activeUnfinishedWash,
      });
      return;
    }

    // Open booking modal
    setBookingModal({
      show: true,
      machine,
      slotId,
      slotLabel,
      clothesCount: 5,
      waterTemperature: 'cold',
      includeIroning: false,
    });
  };

  // Student Confirms Booking from the Modal
  // NOTE: Money is NOT debited yet! It will be debited once approved/done by Admin.
  const handleStudentConfirmBooking = () => {
    if (!authUser || !bookingModal.machine) return;

    const { washPrice, tempPrice, ironingPrice, totalPrice } = calculatePrice(
      bookingModal.clothesCount,
      bookingModal.waterTemperature,
      bookingModal.includeIroning
    );

    const currentBalance = wallets[authUser.id] ?? 0;
    if (currentBalance < totalPrice) {
      showToast('error', `Insufficient wallet balance (₹${currentBalance.toFixed(2)}). Please recharge ₹${(totalPrice - currentBalance).toFixed(2)} more before booking.`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create new booking with paymentStatus: 'pending' (debited upon admin approval/completion)
    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      userId: authUser.id,
      userName: authUser.name,
      userRoom: authUser.roomNumber,
      machineId: bookingModal.machine.id,
      machineName: bookingModal.machine.name,
      date: selectedDate,
      slotId: bookingModal.slotId,
      slotLabel: bookingModal.slotLabel,
      status: 'booked_waiting_approval',
      bookedAt: nowTime,
      clothesCount: bookingModal.clothesCount,
      waterTemperature: bookingModal.waterTemperature,
      includeIroning: bookingModal.includeIroning,
      washPrice,
      tempPrice,
      ironingPrice,
      totalPrice,
      paymentStatus: 'pending',
    };

    setBookings([newBooking, ...bookings]);
    setBookingModal({ ...bookingModal, show: false, machine: null });
    showToast(
      'success',
      `Slot booked for ₹${totalPrice.toFixed(2)}! Status: Waiting for Admin Approval. Money will be debited from wallet once approved & done.`
    );
  };

  // Student Cancels Booking
  const handleStudentCancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // If money was already debited (i.e. approved previously), refund it
    if (booking.paymentStatus === 'paid') {
      const studentBal = wallets[booking.userId] ?? 0;
      setWallets({
        ...wallets,
        [booking.userId]: studentBal + booking.totalPrice,
      });

      const refundTx: WalletTransaction = {
        id: `tx-${Date.now()}-refund`,
        userId: booking.userId,
        userName: booking.userName,
        type: 'refund',
        amount: booking.totalPrice,
        description: `Refund: Cancelled Wash on ${booking.machineName} (${booking.date})`,
        date: formatLocalDate(new Date()),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTransactions([refundTx, ...transactions]);
      showToast('info', `Wash booking cancelled. ₹${booking.totalPrice?.toFixed(2) ?? '0.00'} refunded to your wallet.`);
    } else {
      showToast('info', 'Wash booking cancelled. No money was debited from your wallet.');
    }

    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
    );
  };

  // Admin approves booking: Service is accepted & initiated -> DEBIT STUDENT WALLET & CREDIT ADMIN WALLET
  const handleAdminApproveBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const price = booking.totalPrice ?? (booking.clothesCount || 5) * 5;
    const studentBal = wallets[booking.userId] ?? 0;

    // Check if student still has sufficient balance
    if (studentBal < price && booking.paymentStatus !== 'paid') {
      showToast('error', `Cannot approve: Student ${booking.userName} has insufficient wallet balance (₹${studentBal.toFixed(2)}).`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Debit student wallet and credit admin wallet if not already paid
    if (booking.paymentStatus !== 'paid') {
      const adminBal = wallets['usr-admin'] ?? 0;
      setWallets({
        ...wallets,
        [booking.userId]: studentBal - price,
        'usr-admin': adminBal + price,
      });

      // Record student debit transaction
      const studentTx: WalletTransaction = {
        id: `tx-${Date.now()}-debit`,
        userId: booking.userId,
        userName: booking.userName,
        type: 'wash_payment',
        amount: price,
        description: `Service completed & debited: ${booking.clothesCount || 5} clothes (${booking.waterTemperature || 'cold'} wash${booking.includeIroning ? ' + Ironing' : ''}) on ${booking.machineName}`,
        date: formatLocalDate(new Date()),
        time: nowTime,
      };

      // Record admin credit transaction
      const adminTx: WalletTransaction = {
        id: `tx-${Date.now()}-admin`,
        userId: 'usr-admin',
        userName: 'Facility Admin',
        type: 'admin_revenue',
        amount: price,
        description: `Revenue from ${booking.userName}: ${booking.clothesCount || 5} clothes (${booking.waterTemperature || 'cold'} wash${booking.includeIroning ? ' + Ironing' : ''}) on ${booking.machineName}`,
        date: formatLocalDate(new Date()),
        time: nowTime,
      };

      setTransactions([studentTx, adminTx, ...transactions]);
    }

    setBookings(
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'approved',
              paymentStatus: 'paid',
              approvedAt: nowTime,
            }
          : b
      )
    );
    showToast('success', `Booking approved & done! ₹${price.toFixed(2)} debited from ${booking.userName}'s wallet and credited to Admin.`);
  };

  // Admin marks wash finished
  const handleAdminMarkFinished = (bookingId: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'finished',
              finishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : b
      )
    );
    showToast('success', 'Wash cycle marked as Finished by Admin! Student can now book next wash.');
  };

  // Admin Rejects Booking
  const handleAdminRejectBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.paymentStatus === 'paid') {
      const studentBal = wallets[booking.userId] ?? 0;
      setWallets({
        ...wallets,
        [booking.userId]: studentBal + booking.totalPrice,
      });

      const refundTx: WalletTransaction = {
        id: `tx-${Date.now()}-reject-refund`,
        userId: booking.userId,
        userName: booking.userName,
        type: 'refund',
        amount: booking.totalPrice,
        description: `Refund: Admin rejected wash request on ${booking.machineName}`,
        date: formatLocalDate(new Date()),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTransactions([refundTx, ...transactions]);
      showToast('info', `Booking rejected. ₹${booking.totalPrice?.toFixed(2) ?? '0.00'} refunded to ${booking.userName}'s wallet.`);
    } else {
      showToast('info', `Booking request rejected by Admin. No money was debited.`);
    }

    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
    );
  };

  // Admin: Toggle Machine Maintenance Status
  const handleToggleMachineMaintenance = (machineId: string) => {
    const targetMachine = machines.find((m) => m.id === machineId);
    if (!targetMachine) return;

    const nextStatus = targetMachine.status === 'maintenance' ? 'available' : 'maintenance';
    setMachines(
      machines.map((m) => (m.id === machineId ? { ...m, status: nextStatus } : m))
    );

    showToast(
      nextStatus === 'maintenance' ? 'info' : 'success',
      `${targetMachine.name} status updated: ${nextStatus === 'maintenance' ? 'Under Maintenance (Bookings Paused)' : 'Available for Bookings'}.`
    );
  };

  // Admin: Add New Machine
  const handleAdminAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) {
      showToast('error', 'Please enter a machine name.');
      return;
    }

    const newMachine: DualMachine = {
      id: `mach-${Date.now().toString().slice(-4)}`,
      name: newMachineName.trim(),
      capacity: newMachineCapacity.trim() || '10 kg Wash + 7 kg Steam Dry',
      status: newMachineStatus,
    };

    setMachines([...machines, newMachine]);
    setNewMachineName('');
    setNewMachineCapacity('10 kg Wash + 7 kg Steam Dry');
    setNewMachineStatus('available');
    setAddMachineModal(false);
    showToast('success', `New machine "${newMachine.name}" added successfully!`);
  };

  // Student: Step 1 -> Trigger OTP for Recharge
  const handleInitiateRecharge = (amount: number) => {
    if (!authUser) return;
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Please select or enter a valid amount.');
      return;
    }

    // Generate simulated 4-digit OTP
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(generated);
    setEnteredOtp('');
    setOtpError('');
    setRechargeAmount(amount);
    setOtpStep('otp');
    showToast('info', `OTP sent to mobile +91 ${mobileNumber}: ${generated}`);
  };

  // Student: Step 2 -> Verify OTP and Credit Wallet
  const handleVerifyOtpAndRecharge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authUser) return;

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP! Please check the 4-digit code sent to your mobile.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    setTimeout(() => {
      const currentBal = wallets[authUser.id] ?? 0;
      const newBal = currentBal + rechargeAmount;
      setWallets({
        ...wallets,
        [authUser.id]: newBal,
      });

      const tx: WalletTransaction = {
        id: `tx-${Date.now()}-recharge`,
        userId: authUser.id,
        userName: authUser.name,
        type: 'recharge',
        amount: rechargeAmount,
        description: `Wallet Recharge via ${paymentMethod.toUpperCase()} (OTP Verified)`,
        date: formatLocalDate(new Date()),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTransactions([tx, ...transactions]);

      setIsVerifyingOtp(false);
      setOtpStep('success');
      showToast('success', `Recharge Verified! ₹${rechargeAmount.toFixed(2)} added to your wallet.`);
    }, 400);
  };

  const bookingsForSelectedDate = bookings.filter((b) => b.date === selectedDate);
  const pendingCountForDate = bookingsForSelectedDate.filter((b) => b.status === 'booked_waiting_approval').length;
  const approvedCountForDate = bookingsForSelectedDate.filter((b) => b.status === 'approved').length;
  const finishedCountForDate = bookingsForSelectedDate.filter((b) => b.status === 'finished').length;

  // ----------------------------------------------------
  // RENDER: LOGIN PORTAL
  // ----------------------------------------------------
  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-600/30">
              <WashingMachine className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              SpinSync Hub
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Dual Washer-Dryer Unit Booking & Wallet Portal (₹)
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Account to Login:
            </p>

            <div className="space-y-2">
              {MOCK_USERS.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => setAuthUser(usr)}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all group ${
                    usr.role === 'admin'
                      ? 'bg-amber-50/80 border-amber-200 hover:border-amber-400 text-amber-950'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl p-2 bg-slate-100 rounded-xl border border-slate-200">
                      {usr.avatar}
                    </span>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                        <span>{usr.name}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                            usr.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{usr.email} • {usr.roomNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      ₹{(wallets[usr.id] ?? 0).toFixed(2)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStudentActiveWash = getStudentUnfinishedWash(authUser.id);
  const activeModalPriceBreakdown = calculatePrice(
    bookingModal.clothesCount,
    bookingModal.waterTemperature,
    bookingModal.includeIroning
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-semibold border backdrop-blur-md transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20">
              <WashingMachine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                SpinSync Hub
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {authUser.role === 'admin'
                  ? 'Facility Admin Master Portal'
                  : 'Smart Laundry & Ironing Booking Facility (₹)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Wallet Quick Pill */}
            {authUser.role === 'student' ? (
              <button
                onClick={() => {
                  setOtpStep('amount');
                  setShowStudentWalletModal(true);
                }}
                className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl transition font-semibold text-xs shadow-xs"
                title="View & Recharge Student Wallet with OTP"
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Wallet:</span>
                <span className="font-bold text-emerald-950 font-mono">₹{studentWalletBalance.toFixed(2)}</span>
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center">
                  <Plus className="w-2.5 h-2.5 mr-0.5" /> Top-up (OTP)
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminWalletModal(true)}
                className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl transition font-semibold text-xs shadow-xs"
                title="View Admin Revenue Wallet"
              >
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Revenue Wallet:</span>
                <span className="font-bold font-mono text-amber-900">₹{adminRevenueBalance.toFixed(2)}</span>
              </button>
            )}

            {/* Current Auth User Badge & Logout */}
            <div className="flex items-center space-x-2.5 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-base">{authUser.avatar}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {authUser.name}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-cyan-700">
                  {authUser.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                </p>
              </div>
              <button
                onClick={() => setAuthUser(null)}
                className="p-1 text-slate-400 hover:text-rose-600 transition ml-2"
                title="Logout / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Student Status & Active Wash Restriction Bar */}
        {authUser.role === 'student' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  Logged in: {authUser.name} ({authUser.roomNumber})
                </p>
                <p className="text-slate-500 text-[11px]">
                  Wash Rate: <strong>₹{PRICING_CONFIG.pricePerCloth.toFixed(2)} / cloth</strong> • Ironing: <strong>₹{PRICING_CONFIG.ironingPricePerCloth.toFixed(2)} / cloth</strong> • Hot Water: <strong>+₹{PRICING_CONFIG.hotWaterFlatPrice.toFixed(2)}</strong>. Money debited upon service approval.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setOtpStep('amount');
                  setShowStudentWalletModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-[11px] flex items-center space-x-1 transition"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Wallet: ₹{studentWalletBalance.toFixed(2)}</span>
              </button>

              {currentStudentActiveWash ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Ongoing Wash in Progress ({currentStudentActiveWash.date} - {currentStudentActiveWash.slotLabel})
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Eligible to book 1 wash slot</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN CONTROL BAR: Add Machine & Summary */}
        {authUser.role === 'admin' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Facility Admin Operations & Control Center
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Rate: ₹5 wash/cloth + ₹5 ironing/cloth • Approving service completes the booking & debits student wallet into admin revenue.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAddMachineModal(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center space-x-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Machine</span>
              </button>

              <button
                onClick={() => setShowMachineManagementSection(!showMachineManagementSection)}
                className={`px-3.5 py-2 rounded-xl border font-bold flex items-center space-x-1.5 transition ${
                  showMachineManagementSection
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>{showMachineManagementSection ? 'Hide Machines View' : 'Manage All Machines'}</span>
              </button>

              <button
                onClick={() => setShowAdminWalletModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold flex items-center space-x-1.5 shadow-xs transition"
              >
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Revenue Wallet: ₹{adminRevenueBalance.toFixed(2)}</span>
              </button>
            </div>
          </div>
        )}

        {/* ADMIN MACHINE MANAGEMENT PANEL */}
        {authUser.role === 'admin' && showMachineManagementSection && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Facility Machines Fleet ({machines.length} Units)
                </h3>
              </div>
              <button
                onClick={() => setAddMachineModal(true)}
                className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl font-bold text-xs flex items-center space-x-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Machine</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {machines.map((mach) => (
                <div
                  key={mach.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                    mach.status === 'maintenance'
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{mach.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{mach.capacity}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        mach.status === 'maintenance'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {mach.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Quick Status Action:</span>
                    <button
                      onClick={() => handleToggleMachineMaintenance(mach.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                        mach.status === 'maintenance'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {mach.status === 'maintenance' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Set Available</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Mark Maintenance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-DAY CALENDAR SELECTOR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-cyan-600" />
                <h2 className="text-base font-bold text-slate-900">
                  7-Day Booking Calendar
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Selected Day:{' '}
                <span className="font-bold text-cyan-700">
                  {currentSelectedDayInfo.fullDisplay}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-600 font-medium">Select Date:</span>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value >= minDate && e.target.value <= maxDate) {
                    setSelectedDate(e.target.value);
                  } else {
                    showToast('error', 'Select a date within the 7-day window.');
                  }
                }}
                className="bg-slate-50 border border-slate-300 text-slate-900 font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* 7-Day Card Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {next7Days.map((day) => {
              const isSelected = selectedDate === day.isoDate;
              const studentBooking = authUser.role === 'student' ? bookings.find((b) => b.userId === authUser.id && b.date === day.isoDate && b.status !== 'cancelled') : null;
              const dayBookings = bookings.filter((b) => b.date === day.isoDate && b.status !== 'cancelled');

              return (
                <button
                  key={day.isoDate}
                  onClick={() => setSelectedDate(day.isoDate)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-600 border-cyan-700 text-white shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-base font-extrabold my-1 leading-tight">
                    {day.formattedDate}
                  </span>

                  {authUser.role === 'admin' ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white text-cyan-900 font-bold'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {dayBookings.length > 0 ? `${dayBookings.length} Washes` : 'Open'}
                    </span>
                  ) : studentBooking ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-amber-300 text-amber-950 font-bold' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {studentBooking.status === 'approved'
                        ? 'Approved'
                        : studentBooking.status === 'finished'
                        ? 'Finished'
                        : 'Waiting Appr.'}
                    </span>
                  ) : (
                    <span className={`text-[9px] font-medium ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ADMIN DAILY SUMMARY STATS */}
        {authUser.role === 'admin' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-slate-900 text-sm">
                Admin Master Schedule ({selectedDate})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold border border-amber-200">
                ⏳ Waiting Approval: {pendingCountForDate}
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold border border-blue-200">
                ✔ Approved: {approvedCountForDate}
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                ✅ Finished: {finishedCountForDate}
              </span>
            </div>
          </div>
        )}

        {/* DAILY SCHEDULE GRID */}
        <div className="space-y-4">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                machine.status === 'maintenance'
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            >
              {/* Machine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      machine.status === 'maintenance'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-cyan-600 text-white'
                    }`}
                  >
                    <WashingMachine className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-slate-900">{machine.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-cyan-100 text-cyan-900">
                        Dual Wash + Dry
                      </span>
                      {machine.status === 'maintenance' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          Maintenance
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Capacity: {machine.capacity}
                    </p>
                  </div>
                </div>

                {/* Machine Status Toggle (Admin) */}
                {authUser.role === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleMachineMaintenance(machine.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs ${
                        machine.status === 'maintenance'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                      }`}
                      title={machine.status === 'maintenance' ? 'Re-activate Machine' : 'Put Machine into Maintenance'}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>
                        {machine.status === 'maintenance' ? 'Set Available' : 'Set Under Maintenance'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Time Slots Grid */}
              <div className="mt-4">
                {machine.status === 'maintenance' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800 font-medium flex items-center justify-center space-x-2">
                    <Wrench className="w-4 h-4 text-rose-600" />
                    <span>This unit is currently under maintenance. Slot bookings are disabled until resolved by Admin.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const booking = bookings.find(
                        (b) =>
                          b.machineId === machine.id &&
                          b.date === selectedDate &&
                          b.slotId === slot.id &&
                          b.status !== 'cancelled'
                      );

                      const isBookedByMe = authUser.role === 'student' && booking?.userId === authUser.id;

                      return (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition-all min-h-[120px] ${
                            booking
                              ? booking.status === 'booked_waiting_approval'
                                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                                : booking.status === 'approved'
                                ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs'
                                : 'bg-slate-100 border-slate-300 text-slate-800'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          {/* Slot Time Header */}
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1 font-mono text-[10px] text-slate-600 font-bold">
                            <span>{slot.label.split(' - ')[0]}</span>
                            <span>{slot.label.split(' - ')[1]}</span>
                          </div>

                          {/* Slot Content */}
                          <div className="my-1.5 space-y-1.5">
                            {booking ? (
                              <div className="space-y-1">
                                <p className="text-xs font-bold truncate text-slate-900">
                                  👤 {booking.userName}
                                </p>

                                {/* Wash Details Badges */}
                                <div className="flex flex-wrap gap-1 text-[9px] font-semibold">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 flex items-center">
                                    <Shirt className="w-2.5 h-2.5 mr-0.5" />
                                    {booking.clothesCount ?? 5} pcs
                                  </span>

                                  {booking.waterTemperature === 'hot' ? (
                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 flex items-center">
                                      <Flame className="w-2.5 h-2.5 mr-0.5" />
                                      Hot
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center">
                                      <Droplets className="w-2.5 h-2.5 mr-0.5" />
                                      Cold
                                    </span>
                                  )}

                                  {booking.includeIroning && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center font-bold">
                                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                      Iron
                                    </span>
                                  )}

                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                    ₹{(booking.totalPrice ?? 10).toFixed(2)}
                                  </span>
                                </div>

                                {/* ADMIN ACTIONS ON SLOT CARD */}
                                {authUser.role === 'admin' && (
                                  <div className="pt-1 flex items-center space-x-1">
                                    {booking.status === 'booked_waiting_approval' && (
                                      <>
                                        <button
                                          onClick={() => handleAdminApproveBooking(booking.id)}
                                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center space-x-0.5 shadow-xs"
                                          title={`Approve & Debit ₹${(booking.totalPrice ?? 10).toFixed(2)} from student wallet`}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          onClick={() => handleAdminRejectBooking(booking.id)}
                                          className="p-1 bg-slate-200 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px]"
                                          title="Reject Booking"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}

                                    {booking.status === 'approved' && (
                                      <button
                                        onClick={() => handleAdminMarkFinished(booking.id)}
                                        className="w-full py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center space-x-1 shadow-xs"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Mark Finished</span>
                                      </button>
                                    )}

                                    {booking.status === 'finished' && (
                                      <span className="text-[10px] text-emerald-700 font-bold block text-center w-full">
                                        ✅ Finished
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* STUDENT STATUS ON SLOT CARD */}
                                {authUser.role === 'student' && (
                                  <div className="pt-0.5 text-[10px] font-bold">
                                    {isBookedByMe ? (
                                      booking.status === 'booked_waiting_approval' ? (
                                        <span className="text-amber-800">⏳ Waiting Approval (Debit on Done)</span>
                                      ) : booking.status === 'approved' ? (
                                        <span className="text-blue-800">✔ Approved (Debited ₹{booking.totalPrice})</span>
                                      ) : (
                                        <span className="text-emerald-800">✅ Finished</span>
                                      )
                                    ) : (
                                      <span className="text-slate-500">🔒 Reserved</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-2 text-center">
                                {authUser.role === 'student' ? (
                                  <button
                                    onClick={() => handleStudentInitiateBooking(machine, slot.id, slot.label)}
                                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-300 hover:border-emerald-600 text-emerald-800 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Book Slot</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium block">
                                    Open
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* OVERVIEW TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>
                {authUser.role === 'admin'
                  ? `All Master Bookings (${selectedDate})`
                  : `My Wash Bookings (${authUser.name})`}
              </span>
            </h3>

            <span className="text-xs text-slate-500 font-mono font-bold">
              ROLE: {authUser.role.toUpperCase()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Dual Machine</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Customization</th>
                  <th className="px-4 py-3">Amount & Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(authUser.role === 'admin'
                  ? bookings.filter((b) => b.date === selectedDate)
                  : bookings.filter((b) => b.userId === authUser.id)
                ).map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{bk.userName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{bk.userRoom}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-cyan-900">{bk.machineName}</td>
                    <td className="px-4 py-3">
                      <div>{bk.slotLabel}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{bk.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-semibold text-slate-800">
                          🧺 {bk.clothesCount ?? 5} clothes
                        </span>
                        <div className="flex items-center space-x-1 text-[10px]">
                          <span className={bk.waterTemperature === 'hot' ? 'text-orange-700 font-bold' : 'text-cyan-700 font-bold'}>
                            {bk.waterTemperature === 'hot' ? '♨️ Hot Wash' : '❄️ Cold Wash'}
                          </span>
                          {bk.includeIroning && (
                            <span className="text-purple-700 font-bold bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                              + 👔 Ironing (₹5/cloth)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-900">
                        ₹{(bk.totalPrice ?? 10).toFixed(2)}
                      </div>
                      <div className="text-[10px] font-semibold">
                        {bk.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700">✔ Debited from Wallet</span>
                        ) : bk.paymentStatus === 'refunded' ? (
                          <span className="text-slate-500">↩ Refunded</span>
                        ) : (
                          <span className="text-amber-700">⏳ Debit on Admin Approval</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {bk.status === 'booked_waiting_approval' && (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 border border-amber-300 text-amber-900">
                          Booked and Waiting for Approval
                        </span>
                      )}
                      {bk.status === 'approved' && (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 border border-blue-300 text-blue-900">
                          Approved
                        </span>
                      )}
                      {bk.status === 'finished' && (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 border border-emerald-300 text-emerald-900">
                          Finished
                        </span>
                      )}
                      {bk.status === 'cancelled' && (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-500">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {/* Student CAN ONLY CANCEL */}
                      {authUser.role === 'student' &&
                        (bk.status === 'booked_waiting_approval' || bk.status === 'approved') && (
                          <button
                            onClick={() => handleStudentCancelBooking(bk.id)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-lg text-[11px] font-bold transition"
                          >
                            Cancel Booking
                          </button>
                        )}

                      {/* Admin Actions */}
                      {authUser.role === 'admin' && bk.status === 'booked_waiting_approval' && (
                        <div className="inline-flex space-x-1">
                          <button
                            onClick={() => handleAdminApproveBooking(bk.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs"
                            title="Approve booking and debit money from student wallet into admin revenue"
                          >
                            Approve (₹{(bk.totalPrice ?? 10).toFixed(2)})
                          </button>
                          <button
                            onClick={() => handleAdminRejectBooking(bk.id)}
                            className="px-2 py-1 bg-slate-200 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] transition"
                            title="Reject Booking"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {authUser.role === 'admin' && bk.status === 'approved' && (
                        <button
                          onClick={() => handleAdminMarkFinished(bk.id)}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs"
                        >
                          Mark Finished
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: STUDENT BOOKING & CUSTOMIZATION (Clothes, Temp, Ironing) */}
      {/* ------------------------------------------------------------------ */}
      {bookingModal.show && bookingModal.machine && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <WashingMachine className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Customize Wash & Ironing
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bookingModal.machine.name} • {bookingModal.slotLabel} ({selectedDate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingModal({ ...bookingModal, show: false, machine: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Number of Clothes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center">
                  <Shirt className="w-4 h-4 mr-1 text-cyan-600" />
                  1. Number of Clothes:
                </span>
                <span className="text-cyan-700 font-mono text-[11px] font-bold">
                  Wash: ₹{PRICING_CONFIG.pricePerCloth.toFixed(2)} / cloth
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      setBookingModal({
                        ...bookingModal,
                        clothesCount: Math.max(1, bookingModal.clothesCount - 1),
                      })
                    }
                    className="px-3 py-2 text-slate-700 hover:bg-slate-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bookingModal.clothesCount}
                    onChange={(e) =>
                      setBookingModal({
                        ...bookingModal,
                        clothesCount: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)),
                      })
                    }
                    className="w-14 text-center bg-white font-bold text-sm text-slate-900 py-1.5 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBookingModal({
                        ...bookingModal,
                        clothesCount: Math.min(30, bookingModal.clothesCount + 1),
                      })
                    }
                    className="px-3 py-2 text-slate-700 hover:bg-slate-200 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 flex-1">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBookingModal({ ...bookingModal, clothesCount: count })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        bookingModal.clothesCount === count
                          ? 'bg-cyan-600 text-white border-cyan-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Wash Temperature Option (Hot vs Cold) */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs flex items-center">
                <Droplets className="w-4 h-4 mr-1 text-cyan-600" />
                2. Water Temperature:
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingModal({ ...bookingModal, waterTemperature: 'cold' })}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    bookingModal.waterTemperature === 'cold'
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-2 ring-cyan-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-cyan-600" />
                    <span className="font-bold text-xs">Cold Water Wash</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Standard & fabric gentle • No extra charge
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 font-mono mt-1.5">
                    ₹0.00
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingModal({ ...bookingModal, waterTemperature: 'hot' })}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                    bookingModal.waterTemperature === 'hot'
                      ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs">Hot Water Wash</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Thermal sanitization & deep cleaning
                  </p>
                  <span className="text-[10px] font-bold text-orange-700 font-mono mt-1.5">
                    +₹{PRICING_CONFIG.hotWaterFlatPrice.toFixed(2)}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Ironing Service Option */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                3. Ironing Service (Optional):
              </span>

              <div
                onClick={() =>
                  setBookingModal({
                    ...bookingModal,
                    includeIroning: !bookingModal.includeIroning,
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  bookingModal.includeIroning
                    ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      bookingModal.includeIroning
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Add Professional Steam Ironing Service
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Crisp press & wrinkle-free finishing (+₹{PRICING_CONFIG.ironingPricePerCloth.toFixed(2)} per cloth)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-bold ${
                      bookingModal.includeIroning ? 'text-purple-700' : 'text-slate-400'
                    }`}
                  >
                    +₹{(bookingModal.clothesCount * PRICING_CONFIG.ironingPricePerCloth).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Price Breakdown & Wallet Calculation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200/70 pb-1.5">
                <span>Wash Price Calculation Breakdown</span>
                <span className="text-cyan-700 font-mono">
                  {bookingModal.clothesCount} items
                </span>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Wash ({bookingModal.clothesCount} clothes × ₹{PRICING_CONFIG.pricePerCloth.toFixed(2)}):</span>
                  <span className="font-mono font-bold">₹{activeModalPriceBreakdown.washPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Water Temperature ({bookingModal.waterTemperature === 'hot' ? 'Hot Water' : 'Cold Water'}):</span>
                  <span className="font-mono font-bold">
                    {activeModalPriceBreakdown.tempPrice > 0
                      ? `+₹${activeModalPriceBreakdown.tempPrice.toFixed(2)}`
                      : '₹0.00'}
                  </span>
                </div>

                {bookingModal.includeIroning && (
                  <div className="flex justify-between text-purple-900 font-semibold">
                    <span>Ironing Service ({bookingModal.clothesCount} clothes × ₹{PRICING_CONFIG.ironingPricePerCloth.toFixed(2)}):</span>
                    <span className="font-mono font-bold">+₹{activeModalPriceBreakdown.ironingPrice.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Service Price:</span>
                  <span className="font-mono text-cyan-700 font-extrabold">
                    ₹{activeModalPriceBreakdown.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Wallet Status Notice */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-slate-700">
                    Your Current Wallet Balance:
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ₹{studentWalletBalance.toFixed(2)}
                </span>
              </div>

              {studentWalletBalance < activeModalPriceBreakdown.totalPrice ? (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center justify-between">
                  <span>⚠️ Insufficient balance to cover service! Top-up required.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModal({ ...bookingModal, show: false });
                      setOtpStep('amount');
                      setRechargeAmount(100);
                      setShowStudentWalletModal(true);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] shadow-xs"
                  >
                    + Recharge via OTP
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[10px]">
                  💡 <strong>Debit Policy:</strong> Money will be debited from your wallet once the service is approved and done by Admin.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setBookingModal({ ...bookingModal, show: false, machine: null })}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={studentWalletBalance < activeModalPriceBreakdown.totalPrice}
                onClick={handleStudentConfirmBooking}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md ${
                  studentWalletBalance < activeModalPriceBreakdown.totalPrice
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  Confirm & Book Slot (₹{activeModalPriceBreakdown.totalPrice.toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: ADMIN ADD MACHINE                                         */}
      {/* ------------------------------------------------------------------ */}
      {addMachineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Dual Machine</h3>
                  <p className="text-xs text-slate-500">Expand facility washing & drying units</p>
                </div>
              </div>
              <button
                onClick={() => setAddMachineModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAddMachine} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Machine Unit Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Dual Combo Unit D-106"
                  value={newMachineName}
                  onChange={(e) => setNewMachineName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Capacity & Spec:</label>
                <input
                  type="text"
                  placeholder="e.g. 10 kg Wash + 7 kg Steam Dry"
                  value={newMachineCapacity}
                  onChange={(e) => setNewMachineCapacity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Initial Status:</label>
                <select
                  value={newMachineStatus}
                  onChange={(e) => setNewMachineStatus(e.target.value as 'available' | 'maintenance')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="available">Available (Operational)</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAddMachineModal(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition shadow-xs"
                >
                  Create Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 3: STUDENT WALLET (Balance & SECURE OTP RECHARGE)             */}
      {/* ------------------------------------------------------------------ */}
      {showStudentWalletModal && authUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Student Laundry Wallet</h3>
                  <p className="text-xs text-slate-500">{authUser.name} • {authUser.roomNumber}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStudentWalletModal(false);
                  setOtpStep('amount');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg space-y-2">
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                Available Wallet Balance
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight">
                ₹{studentWalletBalance.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-100">
                Debited only after service is approved & completed by Admin. Secure recharge with OTP verification.
              </p>
            </div>

            {/* OTP RECHARGE WORKFLOW */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              {/* STEP A: Select Amount & Payment Method */}
              {otpStep === 'amount' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <CreditCard className="w-4 h-4 mr-1 text-cyan-600" />
                      Recharge Wallet with OTP Verification
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Step 1 of 2</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Choose Recharge Amount:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setRechargeAmount(amt);
                            setRechargeCustomInput('');
                          }}
                          className={`py-2 rounded-xl border font-bold text-xs transition ${
                            rechargeAmount === amt && !rechargeCustomInput
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>

                    <div className="relative pt-1">
                      <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="10"
                        placeholder="Or enter custom amount in Rupees"
                        value={rechargeCustomInput}
                        onChange={(e) => {
                          setRechargeCustomInput(e.target.value);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            setRechargeAmount(val);
                          }
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700">Payment Gateway:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'upi', label: 'UPI / GPay' },
                        { id: 'card', label: 'Debit Card' },
                        { id: 'netbanking', label: 'Net Banking' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition ${
                            paymentMethod === m.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile number for OTP */}
                  <div className="space-y-1 pt-1">
                    <label className="font-bold text-slate-700 flex items-center">
                      <Smartphone className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Mobile Number for OTP Verification:
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1.5 bg-slate-200 border border-slate-300 rounded-xl font-mono text-slate-700 font-bold">
                        +91
                      </span>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiateRecharge(rechargeAmount)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 mt-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Proceed to Pay ₹{rechargeAmount.toFixed(2)} & Send OTP</span>
                  </button>
                </div>
              )}

              {/* STEP B: OTP Entry & Verification */}
              {otpStep === 'otp' && (
                <div className="space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-emerald-600" />
                      Enter 4-Digit OTP Verification Code
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Step 2 of 2</span>
                  </div>

                  {/* Simulated SMS Alert Banner */}
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-950 text-xs space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-cyan-800">
                      <Smartphone className="w-4 h-4" />
                      <span>Simulated SMS to +91 {mobileNumber}</span>
                    </div>
                    <p className="font-mono text-[11px]">
                      "SpinSync Bank OTP: <strong>{generatedOtp}</strong> is your verification code to add ₹{rechargeAmount.toFixed(2)} to wallet."
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtpAndRecharge} className="space-y-3">
                    <div className="space-y-1 text-center">
                      <label className="font-bold text-slate-700 block">
                        Enter 4-Digit OTP:
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="••••"
                        value={enteredOtp}
                        onChange={(e) => {
                          setEnteredOtp(e.target.value.replace(/\D/g, ''));
                          setOtpError('');
                        }}
                        className="w-40 mx-auto text-center font-mono font-extrabold text-2xl tracking-[0.5em] px-3 py-2 bg-white border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-slate-900"
                        autoFocus
                      />
                      {otpError && (
                        <p className="text-rose-600 font-bold text-[11px] mt-1">{otpError}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEnteredOtp(generatedOtp);
                          setOtpError('');
                        }}
                        className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 rounded-lg text-[10px] font-bold transition"
                      >
                        ⚡ Auto-fill OTP ({generatedOtp})
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                          setGeneratedOtp(newCode);
                          setEnteredOtp('');
                          showToast('info', `New OTP sent: ${newCode}`);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold transition"
                      >
                        Resend OTP
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setOtpStep('amount')}
                        className="w-1/3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center space-x-1"
                      >
                        {isVerifyingOtp ? (
                          <span>Verifying with Bank...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Verify OTP & Add ₹{rechargeAmount.toFixed(2)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP C: Recharge Success Confirmation */}
              {otpStep === 'success' && (
                <div className="p-4 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">OTP Verified & Recharge Successful!</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ₹{rechargeAmount.toFixed(2)} has been credited to your wallet via {paymentMethod.toUpperCase()}.
                    </p>
                  </div>
                  <p className="font-mono text-xs font-bold text-emerald-800">
                    New Balance: ₹{studentWalletBalance.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpStep('amount')}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    Done / Recharge Again
                  </button>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                My Wallet Transactions:
              </h4>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                {transactions
                  .filter((t) => t.userId === authUser.id)
                  .map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            t.type === 'recharge' || t.type === 'refund'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {t.type === 'recharge' || t.type === 'refund' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{t.description}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {t.date} • {t.time}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-xs ${
                          t.type === 'recharge' || t.type === 'refund'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {t.type === 'recharge' || t.type === 'refund' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 4: ADMIN REVENUE & FINANCIALS WALLET                          */}
      {/* ------------------------------------------------------------------ */}
      {showAdminWalletModal && authUser.role === 'admin' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Admin Facility Revenue Wallet</h3>
                  <p className="text-xs text-slate-500">Collected proceeds from Student Wash & Ironing (₹)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminWalletModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Collected Revenue Card */}
            <div className="bg-gradient-to-tr from-amber-600 to-amber-700 rounded-2xl p-5 text-white shadow-lg space-y-2">
              <span className="text-xs uppercase tracking-wider text-amber-100 font-semibold">
                Total Accumulated Revenue
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight">
                ₹{adminRevenueBalance.toFixed(2)}
              </div>
              <p className="text-[11px] text-amber-100">
                Credited dynamically when student wash & ironing requests are approved & done.
              </p>
            </div>

            {/* Revenue Analytics Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-500">Completed Washes:</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {bookings.filter((b) => b.status === 'approved' || b.status === 'finished').length} Orders
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-500">Ironing Services:</p>
                <p className="text-base font-bold text-purple-800 mt-0.5">
                  {bookings.filter((b) => b.includeIroning && (b.status === 'approved' || b.status === 'finished')).length} Orders
                </p>
              </div>
            </div>

            {/* Revenue Transactions Audit Log */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Revenue Inflow Transactions Log:
              </h4>

              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                {transactions
                  .filter((t) => t.userId === 'usr-admin')
                  .map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{t.description}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {t.date} • {t.time}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-xs text-emerald-700">
                        +₹{t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 5: BLOCKED ONGOING WASH ALERT MODAL                          */}
      {/* ------------------------------------------------------------------ */}
      {alertModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{alertModal.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{alertModal.message}</p>
            </div>

            {alertModal.existingBooking && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="text-slate-500 font-medium">Your Active Ongoing Wash:</p>
                <p className="font-bold text-cyan-800">{alertModal.existingBooking.machineName}</p>
                <p className="text-slate-700 font-mono">
                  {alertModal.existingBooking.date} • {alertModal.existingBooking.slotLabel} ({alertModal.existingBooking.status.replace('_', ' ')})
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setAlertModal({ show: false, title: '', message: '' })}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
