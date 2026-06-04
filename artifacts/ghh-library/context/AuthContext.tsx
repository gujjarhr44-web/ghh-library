import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

const MOCK_USERS: Record<string, User & { password: string }> = {
  "student@ghh.com": {
    id: "u001",
    name: "Arjun Sharma",
    email: "student@ghh.com",
    phone: "+91 98765 43210",
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
    phone: "+91 98765 11111",
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
    phone: "+91 98765 00000",
    role: "admin",
    referralCode: "ADMIN2024",
    joinedDate: "2023-01-01",
    password: "123456",
  },
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

  const login = useCallback(async (email: string, _password: string, role: UserRole): Promise<boolean> => {
    const key = email.toLowerCase().trim();
    const mockUser = MOCK_USERS[key];
    if (mockUser && mockUser.role === role) {
      const { password: _pw, ...userData } = mockUser;
      setUser(userData);
      await AsyncStorage.setItem("@ghh_user", JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      referralCode: data.name.toUpperCase().replace(" ", "").slice(0, 6) + "24",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setUser(newUser);
    await AsyncStorage.setItem("@ghh_user", JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem("@ghh_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
