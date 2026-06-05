import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
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

const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: "a1", date: "2025-06-04", dayOfWeek: "Wed", entryTime: "06:15 AM", exitTime: "11:45 AM", duration: "5h 30m", creditDeducted: true },
  { id: "a2", date: "2025-06-03", dayOfWeek: "Tue", entryTime: "06:05 AM", exitTime: "11:30 AM", duration: "5h 25m", creditDeducted: true },
  { id: "a3", date: "2025-06-02", dayOfWeek: "Mon", entryTime: "06:20 AM", exitTime: "12:10 PM", duration: "5h 50m", creditDeducted: true },
  { id: "a4", date: "2025-06-01", dayOfWeek: "Sun", entryTime: "", exitTime: "", duration: "", creditDeducted: false, isLeave: true },
  { id: "a5", date: "2025-05-31", dayOfWeek: "Sat", entryTime: "06:10 AM", exitTime: "11:50 AM", duration: "5h 40m", creditDeducted: true },
  { id: "a6", date: "2025-05-30", dayOfWeek: "Fri", entryTime: "06:00 AM", exitTime: "12:00 PM", duration: "6h 00m", creditDeducted: true },
  { id: "a7", date: "2025-05-29", dayOfWeek: "Thu", entryTime: "06:30 AM", exitTime: "11:15 AM", duration: "4h 45m", creditDeducted: true },
  { id: "a8", date: "2025-05-28", dayOfWeek: "Wed", entryTime: "06:00 AM", exitTime: "11:45 AM", duration: "5h 45m", creditDeducted: true },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "ach1", title: "First Step", description: "First day of attendance", iconName: "star", unlocked: true, progress: 1, target: 1, reward: "+2 Credits" },
  { id: "ach2", title: "Week Warrior", description: "7 day attendance streak", iconName: "flame", unlocked: true, progress: 7, target: 7, reward: "+5 Credits" },
  { id: "ach3", title: "Fortnight Focus", description: "15 day attendance streak", iconName: "trophy", unlocked: true, progress: 15, target: 15, reward: "+10 Credits" },
  { id: "ach4", title: "Month Master", description: "30 day attendance streak", iconName: "medal", unlocked: false, progress: 17, target: 30, reward: "+20 Credits" },
  { id: "ach5", title: "Century Club", description: "100 total attendance days", iconName: "ribbon", unlocked: false, progress: 23, target: 100, reward: "+30 Credits" },
  { id: "ach6", title: "Early Bird", description: "Arrive before 6:30 AM for 7 days", iconName: "sunny", unlocked: false, progress: 5, target: 7, reward: "10% Discount" },
];

const STUDENT_RECORDS: StudentRecord[] = [
  { id: "st1", name: "Arjun Sharma", email: "arjun@email.com", phone: "+91 98765 43210", seat: "A-12", shift: "Morning", creditsRemaining: 28, planExpiry: "2025-07-20", attendance: 87, status: "active", joinDate: "2025-01-15" },
  { id: "st2", name: "Meera Nair", email: "meera@email.com", phone: "+91 99988 77665", seat: "B-04", shift: "Morning", creditsRemaining: 12, planExpiry: "2025-06-18", attendance: 73, status: "active", joinDate: "2025-02-01" },
  { id: "st3", name: "Kabir Khan", email: "kabir@email.com", phone: "+91 77665 54433", seat: "C-07", shift: "Afternoon", creditsRemaining: 5, planExpiry: "2025-06-10", attendance: 60, status: "active", joinDate: "2025-03-10" },
  { id: "st4", name: "Sneha Reddy", email: "sneha@email.com", phone: "+91 88776 65544", seat: "D-02", shift: "Evening", creditsRemaining: 0, planExpiry: "2025-05-30", attendance: 45, status: "expired", joinDate: "2025-01-20" },
  { id: "st5", name: "Rohan Verma", email: "rohan@email.com", phone: "+91 91122 33445", seat: "A-08", shift: "Full Day", creditsRemaining: 22, planExpiry: "2025-07-15", attendance: 91, status: "active", joinDate: "2024-12-05" },
  { id: "st6", name: "Pooja Singh", email: "pooja@email.com", phone: "+91 85544 66778", seat: "B-11", shift: "Morning", creditsRemaining: 18, planExpiry: "2025-07-01", attendance: 82, status: "active", joinDate: "2025-01-28" },
];

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
  addLeave: (date: string) => void;
  cancelLeave: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const DEFAULT_WALLET: CreditWallet = {
  available: 28,
  consumed: 23,
  expired: 2,
  planName: "30 Credits Pack",
  planExpiry: "2025-07-20",
  totalPurchased: 53,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [leaves, setLeaves] = useState<Leave[]>([
    { id: "l1", date: "2025-06-01", status: "approved", creditSaved: true },
    { id: "l2", date: "2025-05-25", status: "approved", creditSaved: true },
  ]);

  const addLeave = useCallback((date: string) => {
    const newLeave: Leave = {
      id: Date.now().toString(),
      date,
      status: "approved",
      creditSaved: true,
    };
    setLeaves(prev => [newLeave, ...prev]);
  }, []);

  const cancelLeave = useCallback((id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      libraries: LIBRARIES,
      getLibrary: (id) => LIBRARIES.find(l => l.id === id),
      seats: SEATS,
      attendanceRecords: ATTENDANCE_RECORDS,
      wallet: DEFAULT_WALLET,
      achievements: ACHIEVEMENTS,
      streak: 17,
      leaves,
      students: STUDENT_RECORDS,
      addLeave,
      cancelLeave,
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
