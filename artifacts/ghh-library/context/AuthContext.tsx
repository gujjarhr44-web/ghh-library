import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE, FETCH_TIMEOUT_MS } from "@/constants/config";

export type UserRole = "student" | "owner" | "admin";

export interface User {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  joinedDate?: string;
  libraryId?: string;
  assignedSeat?: string;
  assignedShift?: string;
  loyaltyLevel?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginWithPhone: (phone: string, role: UserRole) => Promise<{ success: boolean; devOtp?: string; message?: string }>;
  verifyOTP: (phone: string, otp: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Pick<User, "name" | "email" | "phone">>) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  libraryId?: string;
}

const TOKEN_STORAGE_KEY = "@ghh_auth_token";
const USER_STORAGE_KEY = "@ghh_user_profile";

async function apiPost(path: string, body: object, token?: string | null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Bypass-Tunnel-Reminder": "true",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`API call failed to ${API_BASE}${path}:`, err);
    throw err;
  }
}

async function apiGet(path: string, token: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Bypass-Tunnel-Reminder": "true",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Session Restoration & Validation ──────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Validate against live backend in background
          apiGet("/api/auth/me", storedToken)
            .then((res) => {
              if (res && res.success && res.user) {
                setUser(res.user);
                AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user)).catch(console.error);
              }
            })
            .catch(() => {
              // Network offline, keep cached user
            });
        }
      } catch (err) {
        console.warn("Session restore error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Bypass-Tunnel-Reminder": "true",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // ── 1. Email / Password Login ─────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
      try {
        const data = await apiPost("/api/auth/login", { email, password, role });
        if (data.success && data.token && data.user) {
          setUser(data.user);
          setToken(data.token);
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          return { success: true };
        }
        return { success: false, message: data.message || "Invalid credentials." };
      } catch (err: any) {
        return { success: false, message: err.message || "Connection error during login." };
      }
    },
    []
  );

  // ── 2. Request OTP to Phone ───────────────────────────────────────────────
  const loginWithPhone = useCallback(
    async (phone: string, _role: UserRole): Promise<{ success: boolean; devOtp?: string; message?: string }> => {
      try {
        const data = await apiPost("/api/otp/send", { phone });
        return {
          success: data.success === true,
          devOtp: data.devOtp,
          message: data.message,
        };
      } catch {
        return { success: false, message: "Network error. Please try again." };
      }
    },
    []
  );

  // ── 3. Verify OTP & Authenticate ──────────────────────────────────────────
  const verifyOTP = useCallback(
    async (phone: string, otp: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
      try {
        // Step 1: Verify OTP code
        const verifyRes = await apiPost("/api/otp/verify", { phone, otp });
        if (!verifyRes || verifyRes.success !== true) {
          return { success: false, message: verifyRes?.message || "Invalid OTP code." };
        }

        // Step 2: Create / Fetch real user session from backend
        const sessionRes = await apiPost("/api/auth/otp-login", { phone, role });
        if (sessionRes.success && sessionRes.token && sessionRes.user) {
          setUser(sessionRes.user);
          setToken(sessionRes.token);
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, sessionRes.token);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionRes.user));
          return { success: true };
        }

        return { success: false, message: sessionRes?.message || "Could not establish session." };
      } catch (err: any) {
        return { success: false, message: err.message || "Network error verifying OTP." };
      }
    },
    []
  );

  // ── 4. Register New Account ───────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
      try {
        const res = await apiPost("/api/auth/register", data);
        if (res.success && res.token && res.user) {
          setUser(res.user);
          setToken(res.token);
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, res.token);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
          return { success: true };
        }
        return { success: false, message: res.message || "Registration failed." };
      } catch (err: any) {
        return { success: false, message: err.message || "Network error during registration." };
      }
    },
    []
  );

  // ── 5. Update Profile ─────────────────────────────────────────────────────
  const updateUser = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "phone">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  // ── 6. Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithPhone,
        verifyOTP,
        register,
        logout,
        updateUser,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
