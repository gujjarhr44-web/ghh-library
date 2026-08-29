import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE, WS_BASE, FETCH_TIMEOUT_MS } from "@/constants/config";
import { executeSafeAction } from "@/lib/safe-actions";

export interface RemotePopup {
  id: string;
  name: string;
  title: string;
  message: string;
  imageUrl?: string | null;
  icon?: string;
  button1Text?: string;
  button1Action?: string;
  button2Text?: string | null;
  button2Action?: string | null;
  targetScreen?: string;
  targetRole?: string;
  frequency?: string;
  priority?: number;
  isEnabled?: boolean;
}

export interface RemoteBanner {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  buttonText?: string;
  action?: string;
  targetRole?: string;
  priority?: number;
  isEnabled?: boolean;
}

interface RemoteConfigContextValue {
  config: Record<string, any>;
  isLoaded: boolean;
  isMaintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  minVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  activePopups: RemotePopup[];
  activeBanners: RemoteBanner[];
  isFeatureEnabled: (featureKey: string, fallback?: boolean) => boolean;
  isScreenEnabled: (screenKey: string, fallback?: boolean) => boolean;
  getButtonText: (buttonKey: string, fallback: string) => string;
  getButtonAction: (buttonKey: string, fallbackAction: string) => string;
  getText: (textKey: string, fallback: string) => string;
  getThemeColor: (colorKey: string, fallback: string) => string;
  getHomeLayoutOrder: () => string[];
  refreshConfig: () => Promise<void>;
  dispatchSafeAction: (actionString?: string | null, callbacks?: { onOpenModal?: (modalName: string) => void; onDismiss?: () => void }) => void;
}

const DEFAULT_CONFIG: Record<string, any> = {
  "feature.student_registration": true,
  "feature.seat_booking": true,
  "feature.waitlist": true,
  "feature.qr_attendance": true,
  "feature.leave_system": true,
  "feature.rewards": true,
  "feature.referral": true,
  "feature.ai_assistant": true,
  "feature.library_discovery": true,
  "feature.online_payment": false,
  "feature.manual_payment": true,

  "screen.home": true,
  "screen.discover": true,
  "screen.wallet": true,
  "screen.rewards": true,
  "screen.profile": true,

  "btn.scan_qr.label": "Scan QR",
  "btn.scan_qr.action": "OPEN_MODAL:qr_scanner",
  "btn.book_seat.label": "Book Seat",
  "btn.book_seat.action": "OPEN_SCREEN:library_detail",
  "btn.apply_leave.label": "Apply Leave",
  "btn.apply_leave.action": "OPEN_MODAL:leave_modal",
  "btn.recharge.label": "Recharge",
  "btn.recharge.action": "OPEN_SCREEN:wallet",

  "home.layout_order": ["greeting", "membership_card", "seat_card", "qr_action", "quick_actions", "analytics", "rewards", "announcements"],
  "text.app_title": "GHH Library Manager",
  "text.welcome_message": "Find Your Perfect Study Space",
  "text.welcome_subheading": "Book seats, track attendance, and achieve your academic goals.",

  "theme.primary_color": "#4F8EF7",
  "theme.secondary_color": "#10B981",

  "maintenance.enabled": false,
  "maintenance.title": "Scheduled Maintenance",
  "maintenance.message": "Platform undergoing scheduled maintenance. Please check back shortly.",

  "app.min_version": "1.0.0",
  "app.current_version": "1.0.0",
  "app.force_update": false,
};

const RemoteConfigContext = createContext<RemoteConfigContextValue | null>(null);

export function RemoteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, any>>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshConfig = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(`${API_BASE}/api/config/live`, {
        signal: controller.signal,
        headers: { "Bypass-Tunnel-Reminder": "true" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        if (json?.config) {
          const merged = { ...DEFAULT_CONFIG, ...json.config };
          setConfig(merged);
          await AsyncStorage.setItem("@ghh_remote_config", JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote config, using cache:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // 1. Restore local cache first
    AsyncStorage.getItem("@ghh_remote_config").then((cached) => {
      if (cached) {
        try {
          setConfig(JSON.parse(cached));
        } catch {}
      }
      refreshConfig();
    });

    // 2. Listen to WebSocket for live hot updates
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_BASE);
      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.event === "config:updated") {
            refreshConfig();
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) ws.close();
    };
  }, [refreshConfig]);

  const isFeatureEnabled = useCallback(
    (featureKey: string, fallback = true): boolean => {
      const fullKey = featureKey.startsWith("feature.") ? featureKey : `feature.${featureKey}`;
      const val = config[fullKey];
      return val !== undefined ? Boolean(val) : fallback;
    },
    [config]
  );

  const isScreenEnabled = useCallback(
    (screenKey: string, fallback = true): boolean => {
      const fullKey = screenKey.startsWith("screen.") ? screenKey : `screen.${screenKey}`;
      const val = config[fullKey];
      return val !== undefined ? Boolean(val) : fallback;
    },
    [config]
  );

  const getButtonText = useCallback(
    (buttonKey: string, fallback: string): string => {
      const fullKey = buttonKey.endsWith(".label") ? buttonKey : `btn.${buttonKey}.label`;
      return config[fullKey] || fallback;
    },
    [config]
  );

  const getButtonAction = useCallback(
    (buttonKey: string, fallbackAction: string): string => {
      const fullKey = buttonKey.endsWith(".action") ? buttonKey : `btn.${buttonKey}.action`;
      return config[fullKey] || fallbackAction;
    },
    [config]
  );

  const getText = useCallback(
    (textKey: string, fallback: string): string => {
      const fullKey = textKey.startsWith("text.") ? textKey : `text.${textKey}`;
      return config[fullKey] || fallback;
    },
    [config]
  );

  const getThemeColor = useCallback(
    (colorKey: string, fallback: string): string => {
      const fullKey = colorKey.startsWith("theme.") ? colorKey : `theme.${colorKey}`;
      return config[fullKey] || fallback;
    },
    [config]
  );

  const getHomeLayoutOrder = useCallback((): string[] => {
    const raw = config["home.layout_order"];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return DEFAULT_CONFIG["home.layout_order"];
  }, [config]);

  const isMaintenanceMode = Boolean(config["maintenance.enabled"]);
  const maintenanceTitle = config["maintenance.title"] || "Under Maintenance";
  const maintenanceMessage = config["maintenance.message"] || "Please check back shortly.";
  const minVersion = config["app.min_version"] || "1.0.0";
  const currentVersion = config["app.current_version"] || "1.0.0";
  const forceUpdate = Boolean(config["app.force_update"]);
  const activePopups: RemotePopup[] = Array.isArray(config["popups"]) ? config["popups"] : [];
  const activeBanners: RemoteBanner[] = Array.isArray(config["banners"]) ? config["banners"] : [];

  const dispatchSafeAction = useCallback(
    (actionString?: string | null, callbacks?: { onOpenModal?: (modalName: string) => void; onDismiss?: () => void }) => {
      executeSafeAction(actionString, callbacks);
    },
    []
  );

  return (
    <RemoteConfigContext.Provider
      value={{
        config,
        isLoaded,
        isMaintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        minVersion,
        currentVersion,
        forceUpdate,
        activePopups,
        activeBanners,
        isFeatureEnabled,
        isScreenEnabled,
        getButtonText,
        getButtonAction,
        getText,
        getThemeColor,
        getHomeLayoutOrder,
        refreshConfig,
        dispatchSafeAction,
      }}
    >
      {children}
    </RemoteConfigContext.Provider>
  );
}

export function useRemoteConfig() {
  const ctx = useContext(RemoteConfigContext);
  if (!ctx) throw new Error("useRemoteConfig must be used within RemoteConfigProvider");
  return ctx;
}
