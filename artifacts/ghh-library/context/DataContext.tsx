import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

export interface Library {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  area: string;
  rating: number;
  totalSeats: number;
  availableSeats: number;
  occupancyRate: number;
  facilities: string[];
  plans: Plan[];
  shifts: Shift[];
  isVerified: boolean;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  monthlyRevenue: number;
  image: string;
}

export interface Plan {
  id: string;
  credits: number;
  price: number;
  validity: number;
  popular?: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Seat {
  id: string;
  number: string;
  row: string;
  col: number;
  category: "window" | "standard" | "premium";
  status: "available" | "reserved" | "occupied" | "maintenance";
  studentName?: string;
  shiftId: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  creditDeducted: boolean;
  isLeave?: boolean;
}

export interface Leave {
  id: string;
  date: string;
  status: "pending" | "approved" | "cancelled";
  creditSaved: boolean;
}

export interface CreditWallet {
  available: number;
  consumed: number;
  expired: number;
  planName: string;
  planExpiry: string;
  totalPurchased: number;
}

// FIX BUG-07: Added `claimed?: boolean` to Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
  claimed?: boolean;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  seat: string;
  shift: string;
  creditsRemaining: number;
  planExpiry: string;
  attendance: number;
  status: "active" | "suspended" | "expired";
  joinDate: string;
}

const LIBRARIES: Library[] = [
  {
    id: "lib001",
    name: "GHH Central Library",
    ownerName: "Priya Patel",
    address: "12, FC Road, Pune",
    city: "Pune",
    area: "FC Road",
    rating: 4.8,
    totalSeats: 60,
    availableSeats: 14,
    occupancyRate: 77,
    facilities: ["AC", "WiFi", "RO Water", "Parking", "CCTV", "Power Backup"],
    plans: [
      { id: "p1", credits: 15, price: 599, validity: 25 },
      { id: "p2", credits: 30, price: 999, validity: 45, popular: true },
      { id: "p3", credits: 60, price: 1799, validity: 75 },
    ],
    shifts: [
      { id: "s1", name: "Morning", startTime: "06:00 AM", endTime: "12:00 PM" },
      { id: "s2", name: "Afternoon", startTime: "12:00 PM", endTime: "06:00 PM" },
      { id: "s3", name: "Evening", startTime: "06:00 PM", endTime: "11:00 PM" },
      { id: "s4", name: "Full Day", startTime: "06:00 AM", endTime: "11:00 PM" },
    ],
    isVerified: true,
    isOpen: true,
    openTime: "06:00 AM",
    closeTime: "11:00 PM",
    monthlyRevenue: 145000,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80",
  },
  {
    id: "lib002",
    name: "StudyHub Premium",
    ownerName: "Vikram Singh",
    address: "45, Connaught Place, New Delhi",
    city: "New Delhi",
    area: "Connaught Place",
    rating: 4.6,
    totalSeats: 80,
    availableSeats: 22,
    occupancyRate: 73,
    facilities: ["AC", "WiFi", "Cafeteria", "Locker", "CCTV"],
    plans: [
      { id: "p1", credits: 15, price: 799, validity: 25 },
      { id: "p2", credits: 30, price: 1299, validity: 45, popular: true },
      { id: "p3", credits: 60, price: 2299, validity: 75 },
    ],
    shifts: [
      { id: "s1", name: "Morning", startTime: "06:00 AM", endTime: "12:00 PM" },
      { id: "s2", name: "Evening", startTime: "04:00 PM", endTime: "10:00 PM" },
      { id: "s3", name: "Full Day", startTime: "06:00 AM", endTime: "10:00 PM" },
    ],
    isVerified: true,
    isOpen: true,
    openTime: "06:00 AM",
    closeTime: "10:00 PM",
    monthlyRevenue: 212000,
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
  },
  {
    id: "lib003",
    name: "Knowledge Point",
    ownerName: "Ananya Krishnan",
    address: "78, Koramangala, Bangalore",
    city: "Bangalore",
    area: "Koramangala",
    rating: 4.5,
    totalSeats: 45,
    availableSeats: 8,
    occupancyRate: 82,
    facilities: ["AC", "WiFi", "Parking", "Power Backup", "CCTV"],
    plans: [
      { id: "p1", credits: 15, price: 649, validity: 25 },
      { id: "p2", credits: 30, price: 1099, validity: 45, popular: true },
      { id: "p3", credits: 60, price: 1999, validity: 75 },
    ],
    shifts: [
      { id: "s1", name: "Morning", startTime: "05:30 AM", endTime: "01:00 PM" },
      { id: "s2", name: "Afternoon", startTime: "01:00 PM", endTime: "08:00 PM" },
      { id: "s3", name: "Full Day", startTime: "05:30 AM", endTime: "08:00 PM" },
    ],
    isVerified: true,
    isOpen: false,
    openTime: "05:30 AM",
    closeTime: "08:00 PM",
    monthlyRevenue: 98000,
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80",
  },
  {
    id: "lib004",
    name: "Bright Minds Study Zone",
    ownerName: "Deepak Joshi",
    address: "22, Anna Nagar, Chennai",
    city: "Chennai",
    area: "Anna Nagar",
    rating: 4.3,
    totalSeats: 35,
    availableSeats: 18,
    occupancyRate: 49,
    facilities: ["AC", "WiFi", "RO Water"],
    plans: [
      { id: "p1", credits: 15, price: 499, validity: 25 },
      { id: "p2", credits: 30, price: 849, validity: 45, popular: true },
      { id: "p3", credits: 60, price: 1499, validity: 75 },
    ],
    shifts: [
      { id: "s1", name: "Morning", startTime: "07:00 AM", endTime: "02:00 PM" },
      { id: "s2", name: "Evening", startTime: "03:00 PM", endTime: "10:00 PM" },
    ],
    isVerified: false,
    isOpen: true,
    openTime: "07:00 AM",
    closeTime: "10:00 PM",
    monthlyRevenue: 56000,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
  },
];

const SEATS: Seat[] = [
  ...Array.from({ length: 60 }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / 10));
    const col = (i % 10) + 1;
    const statuses: Seat["status"][] = ["available", "reserved", "occupied", "occupied", "occupied", "occupied", "available", "occupied", "reserved", "available"];
    return {
      id: `seat_${i + 1}`,
      number: `${row}-${col}`,
      row,
      col,
      category: col <= 2 ? "window" as const : col >= 9 ? "premium" as const : "standard" as const,
      status: statuses[i % 10],
      studentName: statuses[i % 10] === "occupied" ? `Student ${i + 1}` : undefined,
      shiftId: "s1",
    };
  }),
];

// FIX BUG-18 + BUG-19: Generate mock data with RECENT dates so streak computes correctly
function generateRecentAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = days[d.getDay()];
    if (i === 3) {
      // Day 3 ago is a leave
      records.push({ id: `a${i + 1}`, date: dateStr, dayOfWeek, entryTime: "", exitTime: "", duration: "", creditDeducted: false, isLeave: true });
    } else {
      records.push({ id: `a${i + 1}`, date: dateStr, dayOfWeek, entryTime: "06:15 AM", exitTime: "11:45 AM", duration: "5h 30m", creditDeducted: true });
    }
  }
  return records;
}

const STUDENT_RECORDS: StudentRecord[] = [
  { id: "st1", name: "Arjun Sharma", email: "arjun@email.com", phone: "+91 98765 43210", seat: "A-12", shift: "Morning", creditsRemaining: 28, planExpiry: "2025-07-20", attendance: 87, status: "active", joinDate: "2025-01-15" },
  { id: "st2", name: "Meera Nair", email: "meera@email.com", phone: "+91 99988 77665", seat: "B-04", shift: "Morning", creditsRemaining: 12, planExpiry: "2025-06-18", attendance: 73, status: "active", joinDate: "2025-02-01" },
  { id: "st3", name: "Kabir Khan", email: "kabir@email.com", phone: "+91 77665 54433", seat: "C-07", shift: "Afternoon", creditsRemaining: 5, planExpiry: "2025-06-10", attendance: 60, status: "active", joinDate: "2025-03-10" },
  { id: "st4", name: "Sneha Reddy", email: "sneha@email.com", phone: "+91 88776 65544", seat: "D-02", shift: "Evening", creditsRemaining: 0, planExpiry: "2025-05-30", attendance: 45, status: "expired", joinDate: "2025-01-20" },
  { id: "st5", name: "Rohan Verma", email: "rohan@email.com", phone: "+91 91122 33445", seat: "A-08", shift: "Full Day", creditsRemaining: 22, planExpiry: "2025-07-15", attendance: 91, status: "active", joinDate: "2024-12-05" },
  { id: "st6", name: "Pooja Singh", email: "pooja@email.com", phone: "+91 85544 66778", seat: "B-11", shift: "Morning", creditsRemaining: 18, planExpiry: "2025-07-01", attendance: 82, status: "active", joinDate: "2025-01-28" },
];

export interface AppSettings {
  appTitle: string;
  welcomeMessage: string;
  welcomeSubheading: string;
  themeColor: string;
  isBookSeatClickable: boolean;
  isMarkAttendanceClickable: boolean;
  isApplyLeaveClickable: boolean;
  isPurchasePlanClickable: boolean;
  showAchievements: boolean;
  showQuickStats: boolean;
  showFacilities: boolean;
  showPopup: boolean;
  popupScreen: "any" | "home" | "library" | "qr" | "leave";
  popupTitle: string;
  popupMessage: string;
  popupMediaUrl: string;
  popupPromptPlaceholder: string;
  popupPrimaryButtonText: string;
  popupSecondaryButtonText: string;
  wifiSSID?: string;
  paymentQR?: string;
}

interface DataContextValue {
  libraries: Library[];
  getLibrary: (id: string) => Library | undefined;
  seats: Seat[];
  attendanceRecords: AttendanceRecord[];
  wallet: CreditWallet;
  achievements: Achievement[];
  streak: number;
  leaves: Leave[];
  students: StudentRecord[];
  settings: AppSettings;
  // FIX BUG-12: buyPlan now accepts validityDays to update planExpiry
  addLeave: (date: string) => void;
  cancelLeave: (id: string) => void;
  buyPlan: (credits: number, planName: string, validityDays?: number) => void;
  claimReward: (rewardId: string, credits: number) => void;
  hasActiveSession: () => boolean;
  pendingPayments: PendingPayment[];
  requestPaymentVerification: (credits: number, planName: string, validityDays: number, price: number, transactionId: string) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
}

export interface PendingPayment {
  id: string;
  studentId: string;
  studentName: string;
  credits: number;
  planName: string;
  validityDays: number;
  price: number;
  transactionId: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const DataContext = createContext<DataContextValue | null>(null);

const DEFAULT_WALLET: CreditWallet = {
  available: 28,
  consumed: 23,
  expired: 2,
  planName: "30 Credits Pack",
  planExpiry: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  totalPurchased: 53,
};

const DEFAULT_SETTINGS: AppSettings = {
  appTitle: "GHH Central Library",
  welcomeMessage: "Find Your Perfect Study Space",
  welcomeSubheading: "Book seats, track attendance, and achieve your academic goals.",
  themeColor: "#0079F2",
  isBookSeatClickable: true,
  isMarkAttendanceClickable: true,
  isApplyLeaveClickable: true,
  isPurchasePlanClickable: true,
  showAchievements: true,
  showQuickStats: true,
  showFacilities: true,
  showPopup: false,
  popupScreen: "any",
  popupTitle: "Important Notice",
  popupMessage: "We are introducing new facilities soon!",
  popupMediaUrl: "",
  popupPromptPlaceholder: "",
  popupPrimaryButtonText: "Okay",
  popupSecondaryButtonText: "Dismiss",
  wifiSSID: "GHH_Library_WiFi",
  paymentQR: "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00"
};

// FIX BUG-05: Calculate actual duration from time strings like "06:15 AM"
function calcDuration(entryTimeStr: string, exitTimeStr: string): string {
  try {
    const parseMinutes = (t: string): number => {
      const parts = t.trim().split(" ");
      const [hStr, mStr] = parts[0].split(":");
      const period = parts[1];
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    const entryMin = parseMinutes(entryTimeStr);
    const exitMin = parseMinutes(exitTimeStr);
    const diff = exitMin >= entryMin ? exitMin - entryMin : 24 * 60 - entryMin + exitMin;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  } catch {
    return "--";
  }
}

// FIX BUG-19: Compute streak dynamically from attendance records
function computeStreak(records: AttendanceRecord[]): number {
  const attendedDates = new Set(
    records.filter(r => r.creditDeducted || r.isLeave).map(r => r.date)
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (attendedDates.has(dateStr)) {
      streak++;
    } else {
      break; // gap in streak
    }
  }
  return streak;
}

// Validate that fetched settings has required fields (FIX BUG-16)
function isValidSettings(data: unknown): data is AppSettings {
  if (!data || typeof data !== "object") return false;
  const s = data as Record<string, unknown>;
  return (
    typeof s.appTitle === "string" &&
    typeof s.themeColor === "string" &&
    typeof s.showPopup === "boolean"
  );
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [leaves, setLeaves] = useState<Leave[]>([
    { id: "l1", date: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString().split("T")[0]; })(), status: "approved", creditSaved: true },
    { id: "l2", date: (() => { const d = new Date(); d.setDate(d.getDate() - 12); return d.toISOString().split("T")[0]; })(), status: "approved", creditSaved: true },
  ]);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [wallet, setWallet] = useState<CreditWallet>(DEFAULT_WALLET);

  // FIX BUG-07: achievements now have `claimed` field tracked properly
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "ach1", title: "First Step", description: "First day of attendance", iconName: "star", unlocked: true, progress: 1, target: 1, reward: "+2 Credits", claimed: false },
    { id: "ach2", title: "Week Warrior", description: "7 day attendance streak", iconName: "fire", unlocked: true, progress: 7, target: 7, reward: "+5 Credits", claimed: false },
    { id: "ach3", title: "Fortnight Focus", description: "15 day attendance streak", iconName: "trophy", unlocked: true, progress: 15, target: 15, reward: "+10 Credits", claimed: false },
    { id: "ach4", title: "Month Master", description: "30 day attendance streak", iconName: "medal", unlocked: false, progress: 17, target: 30, reward: "+20 Credits", claimed: false },
    { id: "ach5", title: "Century Club", description: "100 total attendance days", iconName: "ribbon", unlocked: false, progress: 23, target: 100, reward: "+30 Credits", claimed: false },
    { id: "ach6", title: "Early Bird", description: "Arrive before 6:30 AM for 7 days", iconName: "weather-sunny", unlocked: false, progress: 5, target: 7, reward: "10% Discount", claimed: false },
  ]);

  // FIX BUG-18: Load attendanceRecords from AsyncStorage on mount
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(generateRecentAttendanceRecords());

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const stored = await AsyncStorage.getItem("@ghh_attendance");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAttendanceRecords(parsed);
          }
        }
      } catch (err) {
        console.log("Could not load stored attendance:", err);
      }
    };
    loadRecords();
  }, []);

  // FIX BUG-03: Settings polling interval changed from 5s to 60s
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const url = Platform.OS === "web"
          ? "/api/admin/settings"
          : "https://ghhlib2026admin.loca.lt/api/admin/settings";
        const res = await fetch(url, {
          headers: {
            "Bypass-Tunnel-Reminder": "true",
            "Accept": "application/json"
          }
        });
        if (res.ok) {
          // FIX BUG-16: Validate JSON response before applying
          let data: unknown;
          try {
            data = await res.json();
          } catch {
            console.log("Settings response was not valid JSON, keeping current settings");
            return;
          }
          if (isValidSettings(data)) {
            setSettings(data);
          } else {
            console.log("Settings response failed validation, keeping current settings");
          }
        }
      } catch (err) {
        console.log("Using local settings fallback:", err);
      }
    };
    fetchSettings();
    // FIX BUG-03: Was 5000ms, now 60000ms (1 minute) — reduces battery drain
    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  const addLeave = useCallback((date: string) => {
    const newLeave: Leave = {
      id: Date.now().toString(),
      date,
      status: "approved",
      creditSaved: true,
    };
    setLeaves(prev => [newLeave, ...prev]);
  }, []);

  // FIX BUG-21: cancelLeave removes the entry (no credit adjustment needed for future leaves)
  const cancelLeave = useCallback((id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "cancelled" as const } : l).filter(l => l.status !== "cancelled"));
  }, []);

  // FIX BUG-12: buyPlan now accepts validityDays and updates planExpiry accordingly
  const buyPlan = useCallback((credits: number, planName: string, validityDays?: number) => {
    setWallet(prev => {
      const newExpiry = validityDays
        ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : prev.planExpiry;
      return {
        ...prev,
        available: prev.available + credits,
        totalPurchased: prev.totalPurchased + credits,
        planName,
        planExpiry: newExpiry,
      };
    });
  }, []);

  // FIX BUG-07: claimReward properly sets claimed=true (now that interface has the field)
  const claimReward = useCallback((rewardId: string, credits: number) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === rewardId) {
        return { ...ach, claimed: true };
      }
      return ach;
    }));
    setWallet(prev => ({
      ...prev,
      available: prev.available + credits,
    }));
  }, []);

  // FIX BUG-05 + BUG-18: Proper duration calculation + AsyncStorage persistence
  const addAttendanceRecord = useCallback((isEntry: boolean) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

    if (isEntry) {
      const newRec: AttendanceRecord = {
        id: `a_${Date.now()}`,
        date: todayStr,
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()],
        entryTime: timeStr,
        exitTime: "--",
        duration: "Active Session",
        creditDeducted: false,
      };
      setAttendanceRecords(prev => {
        const updated = [newRec, ...prev];
        AsyncStorage.setItem("@ghh_attendance", JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } else {
      setAttendanceRecords(prev => {
        const copy = [...prev];
        if (copy.length > 0 && copy[0].exitTime === "--") {
          // FIX BUG-05: Calculate actual duration from entry time
          const duration = calcDuration(copy[0].entryTime, timeStr);
          copy[0] = {
            ...copy[0],
            exitTime: timeStr,
            duration, // actual calculated duration, not hardcoded
            creditDeducted: true,
          };
          // Deduct credit from wallet
          setWallet(w => ({
            ...w,
            available: Math.max(0, w.available - 1),
            consumed: w.consumed + 1,
          }));
        }
        AsyncStorage.setItem("@ghh_attendance", JSON.stringify(copy)).catch(console.error);
        return copy;
      });
    }
  }, []);

  // FIX BUG-06: Helper to check if there is an active (entry-only) session
  const hasActiveSession = useCallback((): boolean => {
    return attendanceRecords.length > 0 && attendanceRecords[0].exitTime === "--";
  }, [attendanceRecords]);

  // FIX BUG-19: Compute streak dynamically from attendance records
  const streak = useMemo(() => computeStreak(attendanceRecords), [attendanceRecords]);

  // Pending Payments state
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  // Load pending payments on mount
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const stored = await AsyncStorage.getItem("@ghh_pending_payments");
        if (stored) setPendingPayments(JSON.parse(stored));
      } catch (err) {
        console.log("Could not load stored payments:", err);
      }
    };
    loadPayments();
  }, []);

  const requestPaymentVerification = useCallback((credits: number, planName: string, validityDays: number, price: number, transactionId: string) => {
    const newPayment: PendingPayment = {
      id: `pay_${Date.now()}`,
      studentId: "u001", // Default logged-in student id
      studentName: "Arjun Sharma", // Default logged-in student name
      credits,
      planName,
      validityDays,
      price,
      transactionId,
      date: new Date().toISOString().split("T")[0],
      status: "pending"
    };
    setPendingPayments(prev => {
      const updated = [newPayment, ...prev];
      AsyncStorage.setItem("@ghh_pending_payments", JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const approvePayment = useCallback((paymentId: string) => {
    setPendingPayments(prev => {
      const updated = prev.map(p => {
        if (p.id === paymentId) {
          // If approved, update status and add credits to wallet
          buyPlan(p.credits, p.planName, p.validityDays);
          return { ...p, status: "approved" as const };
        }
        return p;
      });
      AsyncStorage.setItem("@ghh_pending_payments", JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, [buyPlan]);

  const rejectPayment = useCallback((paymentId: string) => {
    setPendingPayments(prev => {
      const updated = prev.map(p => p.id === paymentId ? { ...p, status: "rejected" as const } : p);
      AsyncStorage.setItem("@ghh_pending_payments", JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  return (
    <DataContext.Provider value={{
      libraries: LIBRARIES,
      getLibrary: (id) => LIBRARIES.find(l => l.id === id),
      seats: SEATS,
      attendanceRecords,
      wallet,
      achievements,
      streak,
      leaves,
      students: STUDENT_RECORDS,
      settings,
      addLeave,
      cancelLeave,
      buyPlan,
      claimReward,
      addAttendanceRecord,
      hasActiveSession,
      pendingPayments,
      requestPaymentVerification,
      approvePayment,
      rejectPayment
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
