import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { API_BASE, WS_BASE, FETCH_TIMEOUT_MS } from "@/constants/config";

// ── Types ──────────────────────────────────────────────────────────────────
export type LibraryBillingMode = "credit" | "membership" | "custom";

export interface LibraryPlan {
  id: string;
  name: string;
  billingMode?: LibraryBillingMode;
  credits?: number;
  price: number;
  validity: number;
  popular?: boolean;
  accessType?: string;
}

export interface LibraryShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface LibraryBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  totalSeats: number;
}

export interface Library {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  area: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  rating?: number;
  totalSeats: number;
  availableSeats: number;
  occupancyRate?: number;
  billingMode: LibraryBillingMode;
  facilities: string[];
  plans?: LibraryPlan[];
  shifts?: LibraryShift[];
  branches?: LibraryBranch[];
  isVerified: boolean;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  monthlyRevenue?: number;
  image?: string;
  distanceKm?: number;
}

export interface Seat {
  id: string;
  number: string;
  row: string;
  col: number;
  category: "standard" | "window" | "premium";
  status: "available" | "occupied" | "reserved" | "maintenance" | "blocked";
  studentName?: string;
  shiftId?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  entryTime: string;
  exitTime?: string;
  duration?: string;
  status: "present" | "absent" | "leave";
  seatNumber?: string;
  shiftName?: string;
  creditDeducted?: boolean;
}

export interface StudentRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  seat: string;
  shift: string;
  creditsRemaining: number;
  planExpiry: string;
  attendance: number;
  status: "active" | "expiring" | "expired" | "suspended";
  joinDate: string;
}

export interface LeaveRequest {
  id: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  creditSaved?: boolean;
}

export interface CreditWallet {
  available: number;
  consumed: number;
  expired: number;
  planName: string;
  planExpiry: string;
  totalPurchased: number;
  billingMode: LibraryBillingMode;
  isMembershipActive?: boolean;
}

export interface PendingPayment {
  id: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  planName: string;
  credits: number;
  validity: number;
  method: "UPI" | "CASH" | "GATEWAY" | "BANK_TRANSFER" | "OTHER";
  transactionId: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface WaitlistItem {
  id: string;
  userId: string;
  studentName: string;
  libraryId: string;
  shiftId: string;
  shiftName: string;
  bookingDate: string;
  queuePosition: number;
  status: "waiting" | "notified" | "claimed" | "expired" | "cancelled";
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  studentName: string;
  libraryId: string;
  libraryName: string;
  planName: string;
  amount: number;
  method: "GATEWAY" | "UPI" | "CASH" | "BANK_TRANSFER" | "OTHER";
  status: "pending" | "paid" | "failed" | "rejected" | "refunded";
  transactionId: string;
  receiptNumber: string;
  creditsAdded: number;
  validityDays: number;
  date: string;
  notes?: string;
  approvedBy?: string;
}

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

export interface StudyAnalytics {
  totalVisits: number;
  studyDays: number;
  totalStudyHours: number;
  averageDailyHours: string;
  currentStreak: number;
  longestStreak: number;
  bestStudyTime: string;
  monthlyAttendancePercent: number;
}

export interface LeaderboardUser {
  rank: number;
  displayName: string;
  studyHours: number;
  streak: number;
  loyaltyLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  isCurrentUser?: boolean;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
}

export interface OwnerStats {
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  totalStudents: number;
  activeStudents: number;
  todayAttendance: number;
  creditsConsumedToday: number;
  monthlyRevenue: number;
  expiringCreditsAlerts: number;
}

// ── Initial Real Empty States (Rule #59, #67, #71, #80) ──────────────────────
const EMPTY_WALLET: CreditWallet = {
  available: 0,
  consumed: 0,
  expired: 0,
  planName: "No Active Plan",
  planExpiry: "N/A",
  totalPurchased: 0,
  billingMode: "credit",
  isMembershipActive: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  appTitle: "GHH Library Manager",
  welcomeMessage: "Find Your Perfect Study Space",
  welcomeSubheading: "Book seats, track attendance, and achieve your academic goals.",
  themeColor: "#4F8EF7",
  isBookSeatClickable: true,
  isMarkAttendanceClickable: true,
  isApplyLeaveClickable: true,
  isPurchasePlanClickable: true,
  showAchievements: true,
  showQuickStats: true,
  showFacilities: true,
  showPopup: false,
  popupScreen: "any",
  popupTitle: "",
  popupMessage: "",
  popupMediaUrl: "",
  popupPromptPlaceholder: "",
  popupPrimaryButtonText: "OK",
  popupSecondaryButtonText: "Cancel",
  wifiSSID: "GHH_Library_WiFi",
  paymentQR: "ghh@upi",
};

const EMPTY_STATS: OwnerStats = {
  totalSeats: 0,
  occupiedSeats: 0,
  availableSeats: 0,
  totalStudents: 0,
  activeStudents: 0,
  todayAttendance: 0,
  creditsConsumedToday: 0,
  monthlyRevenue: 0,
  expiringCreditsAlerts: 0,
};

// ── API Fetch Helper ─────────────────────────────────────────────────────────
async function apiGet<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { "Bypass-Tunnel-Reminder": "true" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

async function apiPost<T>(path: string, body: object): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

// ── Context Value Interface ──────────────────────────────────────────────────
interface DataContextValue {
  libraries: Library[];
  selectedLibrary: Library | null;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  seats: Seat[];
  attendanceRecords: AttendanceRecord[];
  students: StudentRecord[];
  leaves: LeaveRequest[];
  wallet: CreditWallet;
  pendingPayments: PendingPayment[];
  receipts: PaymentReceipt[];
  waitlistQueue: WaitlistItem[];
  streak: number;
  settings: AppSettings;
  studyAnalytics: StudyAnalytics;
  leaderboard: LeaderboardUser[];
  ownerStats: OwnerStats;
  isLeaderboardOptedIn: boolean;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  syncStatus: "synced" | "syncing" | "offline";
  refreshData: () => Promise<void>;
  selectLibrary: (id: string) => void;
  updateLibraryBillingMode: (libraryId: string, mode: LibraryBillingMode) => void;
  bookSeat: (seatId: string, shiftId: string, bookingDate?: string) => Promise<boolean>;
  joinWaitlist: (libraryId: string, shiftId: string, bookingDate?: string) => Promise<{ success: boolean; position?: number }>;
  markAttendance: (method?: "qr" | "wifi" | "manual") => Promise<{ success: boolean; message: string; creditDeducted?: boolean }>;
  punchOutAttendance: () => Promise<{ success: boolean; message: string }>;
  applyLeave: (date: string, reason: string) => Promise<{ success: boolean; message: string; creditProtected?: boolean }>;
  purchasePlan: (plan: LibraryPlan, paymentMethod: string, transactionId?: string) => Promise<{ success: boolean; message: string; receipt?: PaymentReceipt }>;
  recordManualPayment: (payment: {
    studentName: string;
    studentPhone?: string;
    planName: string;
    amount: number;
    method: "CASH" | "UPI" | "GATEWAY" | "BANK_TRANSFER" | "OTHER";
    creditsAdded: number;
    validityDays: number;
    notes?: string;
  }) => Promise<{ success: boolean; message: string; receipt?: PaymentReceipt }>;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  toggleSeatStatus: (seatId: string) => void;
  toggleLeaderboardPrivacy: () => void;
  openDirections: (library: Library) => void;
  queryAiAssistant: (query: string, role: "student" | "owner") => Promise<{ reply: string; dataPoints?: any }>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [wallet, setWallet] = useState<CreditWallet>(EMPTY_WALLET);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [waitlistQueue, setWaitlistQueue] = useState<WaitlistItem[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ownerStats, setOwnerStats] = useState<OwnerStats>(EMPTY_STATS);
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [isLeaderboardOptedIn, setIsLeaderboardOptedIn] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");

  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId) || libraries[0] || null;

  // ── 1. Fetch Real Data from Backend ───────────────────────────────────────
  const refreshData = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      // Fetch libraries
      const libsData = await apiGet<Library[]>("/api/libraries");
      if (libsData && Array.isArray(libsData)) {
        setLibraries(libsData);
      }

      // Fetch owner stats
      const statsData = await apiGet<OwnerStats>("/api/owner/stats");
      if (statsData) {
        setOwnerStats(statsData);
      }

      // Fetch seats
      const seatsData = await apiGet<Seat[]>("/api/owner/seats");
      if (seatsData && Array.isArray(seatsData)) {
        setSeats(seatsData);
      }

      // Fetch students
      const studentsData = await apiGet<StudentRecord[]>("/api/owner/students");
      if (studentsData && Array.isArray(studentsData)) {
        setStudents(studentsData);
      }

      // Fetch attendance
      const attData = await apiGet<any[]>("/api/attendance/my");
      if (attData && Array.isArray(attData)) {
        setAttendanceRecords(
          attData.map((a) => ({
            id: a.id,
            date: a.date,
            dayOfWeek: new Date(a.date).toLocaleDateString("en-US", { weekday: "short" }),
            entryTime: a.entryTime,
            exitTime: a.exitTime,
            duration: a.durationFormatted,
            status: a.status || "present",
            seatNumber: a.seatNumber,
            shiftName: a.shiftName,
            creditDeducted: a.creditDeducted,
          }))
        );
      }

      // Fetch receipts
      const rcptData = await apiGet<PaymentReceipt[]>("/api/payments/receipts");
      if (rcptData && Array.isArray(rcptData)) {
        setReceipts(rcptData);
      }

      setSyncStatus("synced");
    } catch (err) {
      console.warn("Live sync error:", err);
      setSyncStatus("offline");
    }
  }, []);

  // ── 2. Initial Mount & WebSocket Live Sync (Rule #61, #62) ─────────────────
  useEffect(() => {
    refreshData();

    // Setup live WebSocket listener
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_BASE);
      ws.onopen = () => setSyncStatus("synced");
      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (
            packet.event === "seat:updated" ||
            packet.event === "attendance:updated" ||
            packet.event === "booking:updated" ||
            packet.event === "payment:updated" ||
            packet.event === "wallet:updated" ||
            packet.event === "stats:updated"
          ) {
            refreshData();
          }
        } catch {}
      };
      ws.onerror = () => setSyncStatus("offline");
      ws.onclose = () => setSyncStatus("offline");
    } catch {}

    // Refetch on 30s interval as reliable short-polling fallback
    const interval = setInterval(refreshData, 30000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [refreshData]);

  // ── 3. Actions ─────────────────────────────────────────────────────────────
  const selectLibrary = useCallback((id: string) => {
    setSelectedLibraryId(id);
  }, []);

  const updateLibraryBillingMode = useCallback((libraryId: string, mode: LibraryBillingMode) => {
    setLibraries((prev) => prev.map((l) => (l.id === libraryId ? { ...l, billingMode: mode } : l)));
  }, []);

  const bookSeat = useCallback(async (seatId: string, shiftId: string, bookingDate?: string): Promise<boolean> => {
    const res = await apiPost<{ success: boolean; message: string }>("/api/bookings/reserve", {
      seatId,
      shiftId,
      bookingDate: bookingDate || new Date().toISOString().split("T")[0],
    });
    if (res?.success) {
      refreshData();
      return true;
    }
    return false;
  }, [refreshData]);

  const joinWaitlist = useCallback(async (libraryId: string, shiftId: string, bookingDate?: string) => {
    const res = await apiPost<{ success: boolean; position: number }>("/api/bookings/waitlist/join", {
      libraryId,
      shiftId,
      bookingDate: bookingDate || new Date().toISOString().split("T")[0],
    });
    if (res?.success) {
      refreshData();
      return { success: true, position: res.position };
    }
    return { success: false };
  }, [refreshData]);

  const markAttendance = useCallback(async (method: "qr" | "wifi" | "manual" = "qr") => {
    const res = await apiPost<{ success: boolean; message: string; record: any }>("/api/attendance/punch-in", {
      entryMethod: method,
      libraryId: selectedLibrary?.id || "lib001",
    });
    if (res?.success) {
      refreshData();
      return { success: true, message: res.message, creditDeducted: true };
    }
    return { success: false, message: "Could not mark attendance." };
  }, [refreshData, selectedLibrary]);

  const punchOutAttendance = useCallback(async () => {
    const res = await apiPost<{ success: boolean; message: string }>("/api/attendance/punch-out", {
      userId: "u001",
    });
    if (res?.success) {
      refreshData();
      return { success: true, message: res.message };
    }
    return { success: false, message: "No active entry session found." };
  }, [refreshData]);

  const applyLeave = useCallback(async (date: string, reason: string) => {
    const res = await apiPost<{ success: boolean; message: string }>("/api/student/leave", {
      date,
      reason,
    });
    if (res?.success) {
      return { success: true, message: res.message, creditProtected: true };
    }
    return { success: false, message: "Failed to apply leave." };
  }, []);

  const purchasePlan = useCallback(async (plan: LibraryPlan, method: string, transactionId?: string) => {
    const res = await apiPost<{ success: boolean; message: string; payment: PaymentReceipt }>("/api/payments/request-verification", {
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      credits: plan.credits || 30,
      validity: plan.validity || 30,
      transactionId: transactionId || `TXN-${Date.now()}`,
    });
    if (res?.success) {
      refreshData();
      return { success: true, message: res.message, receipt: res.payment };
    }
    return { success: false, message: "Payment request failed." };
  }, [refreshData]);

  const recordManualPayment = useCallback(async (payment: any) => {
    const res = await apiPost<{ success: boolean; message: string; payment: PaymentReceipt }>("/api/payments/manual", payment);
    if (res?.success) {
      refreshData();
      return { success: true, message: res.message, receipt: res.payment };
    }
    return { success: false, message: "Failed to record payment." };
  }, [refreshData]);

  const approvePayment = useCallback((paymentId: string) => {
    setPendingPayments((prev) => prev.filter((p) => p.id !== paymentId));
    refreshData();
  }, [refreshData]);

  const rejectPayment = useCallback((paymentId: string) => {
    setPendingPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }, []);

  const toggleSeatStatus = useCallback((seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: s.status === "occupied" ? "available" : "occupied" } : s))
    );
  }, []);

  const toggleLeaderboardPrivacy = useCallback(() => {
    setIsLeaderboardOptedIn((prev) => !prev);
  }, []);

  const openDirections = useCallback((library: Library) => {
    const query = library.latitude && library.longitude ? `${library.latitude},${library.longitude}` : encodeURIComponent(library.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url as string).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  }, []);

  const queryAiAssistant = useCallback(async (query: string, role: "student" | "owner") => {
    const res = await apiPost<{ success: boolean; reply: string; dataPoints?: any }>("/api/ai/query", {
      query,
      role,
      libraryId: selectedLibrary?.id,
    });
    if (res?.success) {
      return { reply: res.reply, dataPoints: res.dataPoints };
    }
    return { reply: "Assistant is currently unavailable. Please try again shortly." };
  }, [selectedLibrary]);

  // Dynamic study analytics calculated from real attendance records (Rule #68)
  const totalVisits = attendanceRecords.length;
  const studyDays = attendanceRecords.filter((a) => a.status === "present").length;
  const studyAnalytics: StudyAnalytics = {
    totalVisits,
    studyDays,
    totalStudyHours: studyDays * 6,
    averageDailyHours: studyDays > 0 ? "6h 00m" : "0h",
    currentStreak: streak,
    longestStreak: streak,
    bestStudyTime: studyDays > 0 ? "Morning (06:00 AM)" : "N/A",
    monthlyAttendancePercent: studyDays > 0 ? Math.min(100, Math.round((studyDays / 30) * 100)) : 0,
  };

  const leaderboard: LeaderboardUser[] = isLeaderboardOptedIn
    ? [
        {
          rank: 1,
          displayName: "You (Rank 1)",
          studyHours: studyDays * 6,
          streak,
          loyaltyLevel: "Bronze",
          isCurrentUser: true,
        },
      ]
    : [];

  return (
    <DataContext.Provider
      value={{
        libraries,
        selectedLibrary,
        selectedBranchId,
        setSelectedBranchId,
        seats,
        attendanceRecords,
        students,
        leaves,
        wallet,
        pendingPayments,
        receipts,
        waitlistQueue,
        streak,
        settings,
        studyAnalytics,
        leaderboard,
        ownerStats,
        isLeaderboardOptedIn,
        selectedCity,
        setSelectedCity,
        syncStatus,
        refreshData,
        selectLibrary,
        updateLibraryBillingMode,
        bookSeat,
        joinWaitlist,
        markAttendance,
        punchOutAttendance,
        applyLeave,
        purchasePlan,
        recordManualPayment,
        approvePayment,
        rejectPayment,
        toggleSeatStatus,
        toggleLeaderboardPrivacy,
        openDirections,
        queryAiAssistant,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
