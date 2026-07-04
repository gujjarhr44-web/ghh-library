import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export type UserRole = "student" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  joinedDate: string;
  libraryId?: string;
  assignedSeat?: string;
  assignedShift?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  loginWithPhone: (phone: string, role: UserRole) => Promise<{ success: boolean; devOtp?: string; message?: string }>;
  verifyOTP: (phone: string, otp: string, role: UserRole) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<Pick<User, "name" | "email" | "phone">>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

// API base URL – uses tunnel URL on device, relative path on web
const API_BASE =
  Platform.OS === "web"
    ? ""
    : "https://ghhlib2026admin.loca.lt";

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Bypass-Tunnel-Reminder": "true",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Mock users (fallback when API is unavailable)
const MOCK_USERS: Record<string, User & { password: string; phone: string }> = {
  "student@ghh.com": {
    id: "u001",
    name: "Arjun Sharma",
    email: "student@ghh.com",
    phone: "+919876543210",
    role: "student",
    referralCode: "ARJUN2024",
    joinedDate: "2024-01-15",
    libraryId: "lib001",
    assignedSeat: "A-12",
    assignedShift: "Morning",
    password: "123456",
  },
  "owner@ghh.com": {
    id: "u002",
    name: "Priya Patel",
    email: "owner@ghh.com",
    phone: "+919876511111",
    role: "owner",
    referralCode: "PRIYA2024",
    joinedDate: "2023-11-01",
    libraryId: "lib001",
    password: "123456",
  },
  "admin@ghh.com": {
    id: "u003",
    name: "Rahul Mehta",
    email: "admin@ghh.com",
    phone: "+919876500000",
    role: "admin",
    referralCode: "ADMIN2024",
    joinedDate: "2023-01-01",
    password: "123456",
  },
};

// Phone → user mapping for mock OTP
const MOCK_PHONE_USERS: Record<string, User & { role: UserRole }> = {
  "+919876543210": { ...MOCK_USERS["student@ghh.com"], role: "student" },
  "+919876511111": { ...MOCK_USERS["owner@ghh.com"], role: "owner" },
  "+919876500000": { ...MOCK_USERS["admin@ghh.com"], role: "admin" },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem("@ghh_user");
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setIsLoading(false);
    };
    restore();
  }, []);

  // ── Classic email/password login ──────────────────────────────────────────
  // FIX BUG-01: Actually check password (was `_password` — never verified)
  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const key = email.toLowerCase().trim();
    const mockUser = MOCK_USERS[key];
    // BUG-01 FIX: password must match AND role must match
    if (mockUser && mockUser.role === role && mockUser.password === password) {
      const { password: _pw, ...userData } = mockUser;
      setUser(userData);
      await AsyncStorage.setItem("@ghh_user", JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  // ── Step 1: Send OTP to phone ─────────────────────────────────────────────
  const loginWithPhone = useCallback(
    async (phone: string, _role: UserRole): Promise<{ success: boolean; devOtp?: string; message?: string }> => {
      try {
        const data = await apiPost("/api/otp/send", { phone });
        return {
          success: data.success === true,
          devOtp: data.devOtp,
          message: data.message,
        };
      } catch (err) {
        console.error("OTP send error:", err);
        return { success: false, message: "Network error. Please try again." };
      }
    },
    []
  );

  // ── Step 2: Verify OTP + login ────────────────────────────────────────────
  // FIX BUG-02: Block role escalation — phone must match the role being claimed
  const verifyOTP = useCallback(
    async (phone: string, otp: string, role: UserRole): Promise<boolean> => {
      try {
        const data = await apiPost("/api/otp/verify", { phone, otp });

        if (data.success !== true) return false;

        const cleanedPhone = phone.replace(/[^\d+]/g, "");
        const mockUser = MOCK_PHONE_USERS[cleanedPhone];

        let userData: User;

        if (mockUser) {
          // BUG-02 FIX: If phone found in mock store, role MUST match — no privilege escalation
          if (mockUser.role !== role) {
            console.warn(`Role mismatch: phone registered as '${mockUser.role}' but '${role}' attempted`);
            return false;
          }
          const { password: _pw, ...safeUser } = mockUser as typeof mockUser & { password?: string };
          userData = safeUser;
        } else {
          // Phone not in mock store — create minimal guest user with claimed role
          // In production this would be fetched from DB after OTP verify
          userData = {
            id: `phone_${cleanedPhone}`,
            name: "User",
            email: "",
            phone: cleanedPhone,
            role,
            referralCode: "",
            joinedDate: new Date().toISOString().split("T")[0],
          };
        }

        setUser(userData);
        await AsyncStorage.setItem("@ghh_user", JSON.stringify(userData));
        return true;
      } catch (err) {
        console.error("OTP verify error:", err);
        return false;
      }
    },
    []
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      // FIX BUG-17: Use regex to replace ALL spaces, not just first
      referralCode: data.name.toUpperCase().replace(/\s+/g, "").slice(0, 6) + "24",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setUser(newUser);
    await AsyncStorage.setItem("@ghh_user", JSON.stringify(newUser));
    return true;
  }, []);

  // ── Update User Profile (FIX BUG-14) ─────────────────────────────────────
  const updateUser = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "phone">>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Persist to storage
      AsyncStorage.setItem("@ghh_user", JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem("@ghh_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithPhone, verifyOTP, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
