import { Platform } from "react-native";

// Centralized API Base URL Configuration
// Priorities:
// 1. Environment Variable process.env.EXPO_PUBLIC_API_URL (if provided)
// 2. Production API / Local IP fallback when on mobile
// 3. Relative URL on Web
export const getApiBaseUrl = (): string => {
  if (Platform.OS === "web") {
    return "";
  }

  // Use explicit environment variable if set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Production API endpoint fallback
  return "https://ghh-library-s4pl.onrender.com";
};

export const API_BASE = getApiBaseUrl();

export const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout for network calls
