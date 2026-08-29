import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE, FETCH_TIMEOUT_MS } from "@/constants/config";

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

async function apiPost(path: string, body: object) {
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
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`API call failed to ${API_BASE}${path}:`, err);
    throw err;
  }
}

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

  // ── Email/password login ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, _password: string, role: UserRole): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = cleanEmail.split("@")[0] || "User";
    const userData: User = {
      id: `usr_${Date.now()}`,
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      email: cleanEmail,
      phone: "+91",
      role,
      referralCode: cleanName.toUpperCase().slice(0, 6) + "24",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setUser(userData);
    await AsyncStorage.setItem("@ghh_user", JSON.stringify(userData));
    return true;
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
  const verifyOTP = useCallback(
    async (phone: string, otp: string, role: UserRole): Promise<boolean> => {
      try {
        const data = await apiPost("/api/otp/verify", { phone, otp });
        if (data.success !== true) return false;

        const cleanedPhone = phone.replace(/[^\d+]/g, "");
        const userData: User = {
          id: `phone_${cleanedPhone}`,
          name: "Library Member",
          email: "",
          phone: cleanedPhone,
          role,
          referralCode: "GHH" + cleanedPhone.slice(-4),
          joinedDate: new Date().toISOString().split("T")[0],
        };

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
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      referralCode: data.name.toUpperCase().replace(/\s+/g, "").slice(0, 6) + "24",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setUser(newUser);
    await AsyncStorage.setItem("@ghh_user", JSON.stringify(newUser));
    return true;
  }, []);

  // ── Update User Profile ───────────────────────────────────────────────────
  const updateUser = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "phone">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
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
