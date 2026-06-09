import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AppSetting {
  key: string;
  value: string;
  type: "boolean" | "text" | "color" | "number" | "json" | "select";
  category: string;
  label: string;
  description?: string;
  options?: string[];
  updatedAt: string;
}

interface SettingsContextValue {
  settings: Map<string, AppSetting>;
  isLoaded: boolean;
  isConnected: boolean;
  getSetting: (key: string, fallback?: string) => string;
  getBoolean: (key: string, fallback?: boolean) => boolean;
  getColor: (key: string, fallback?: string) => string;
  updateSetting: (key: string, value: string) => Promise<void>;
  bulkUpdate: (updates: Record<string, string>) => Promise<void>;
  resetDefaults: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const SettingsContext = createContext<SettingsContextValue>({
  settings: new Map(),
  isLoaded: false,
  isConnected: false,
  getSetting: () => "",
  getBoolean: () => true,
  getColor: () => "#6366f1",
  updateSetting: async () => {},
  bulkUpdate: async () => {},
  resetDefaults: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Map<string, AppSetting>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/settings");
      if (res.ok) {
        const data: AppSetting[] = await res.json();
        const map = new Map<string, AppSetting>();
        data.forEach((s) => map.set(s.key, s));
        setSettings(map);
        setIsLoaded(true);
        applyThemeSettings(map);
      }
    } catch (err) {
      console.error("[AppSettings] Failed to load settings:", err);
      setIsLoaded(true); // still mark loaded so app doesn't hang
    }
  }, []);

  // Apply theme CSS vars
  const applyThemeSettings = (map: Map<string, AppSetting>) => {
    const root = document.documentElement;
    const primary = map.get("theme.primary_color")?.value;
    const secondary = map.get("theme.secondary_color")?.value;
    const font = map.get("theme.font_family")?.value;
    const fontSize = map.get("theme.font_size")?.value;

    if (primary) root.style.setProperty("--cms-primary", primary);
    if (secondary) root.style.setProperty("--cms-secondary", secondary);
    if (font) root.style.setProperty("--cms-font-family", `'${font}', sans-serif`);
    if (fontSize) {
      const sizeMap: Record<string, string> = { small: "13px", medium: "15px", large: "17px" };
      root.style.setProperty("--cms-font-size", sizeMap[fontSize] || "15px");
    }
  };

  // Connect WebSocket
  const connectWS = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("[AppSettings] WebSocket connected");
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as { event: string; data: unknown };

        if (msg.event === "settings:init") {
          const data = msg.data as AppSetting[];
          const map = new Map<string, AppSetting>();
          data.forEach((s) => map.set(s.key, s));
          setSettings(map);
          setIsLoaded(true);
          applyThemeSettings(map);
        } else if (msg.event === "settings:update") {
          const { setting } = msg.data as { key: string; value: string; setting: AppSetting };
          setSettings((prev) => {
            const next = new Map(prev);
            next.set(setting.key, setting);
            applyThemeSettings(next);
            return next;
          });
        } else if (msg.event === "settings:bulk_update" || msg.event === "settings:reset") {
          const { settings: all } = msg.data as { settings: AppSetting[] };
          const map = new Map<string, AppSetting>();
          all.forEach((s) => map.set(s.key, s));
          setSettings(map);
          applyThemeSettings(map);
        } else if (msg.event === "settings:delete") {
          const { key } = msg.data as { key: string };
          setSettings((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        }
      } catch (e) {
        console.error("[AppSettings] WS message parse error:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("[AppSettings] WebSocket disconnected, reconnecting in 3s...");
      reconnectTimer.current = setTimeout(() => connectWS(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    loadSettings();
    connectWS();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [loadSettings, connectWS]);

  // ── API Methods ──────────────────────────────────────────────────────────────
  const updateSetting = useCallback(async (key: string, value: string) => {
    await fetch(`/api/admin/cms/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    // WS will push the update back, but also update locally for instant feel
    setSettings((prev) => {
      const next = new Map(prev);
      const existing = prev.get(key);
      if (existing) next.set(key, { ...existing, value, updatedAt: new Date().toISOString() });
      return next;
    });
  }, []);

  const bulkUpdate = useCallback(async (updates: Record<string, string>) => {
    await fetch("/api/admin/cms/settings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }, []);

  const resetDefaults = useCallback(async () => {
    await fetch("/api/admin/cms/reset", { method: "POST" });
  }, []);

  // ── Getters ──────────────────────────────────────────────────────────────────
  const getSetting = useCallback(
    (key: string, fallback = "") => settings.get(key)?.value ?? fallback,
    [settings]
  );

  const getBoolean = useCallback(
    (key: string, fallback = true) => {
      const val = settings.get(key)?.value;
      if (val === undefined) return fallback;
      return val === "true";
    },
    [settings]
  );

  const getColor = useCallback(
    (key: string, fallback = "#6366f1") => settings.get(key)?.value ?? fallback,
    [settings]
  );

  return (
    <SettingsContext.Provider
      value={{ settings, isLoaded, isConnected, getSetting, getBoolean, getColor, updateSetting, bulkUpdate, resetDefaults }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useAppSettings() {
  return useContext(SettingsContext);
}

/** किसी भी text को admin panel से control करें */
export function useText(key: string, fallback = "") {
  const { getSetting } = useContext(SettingsContext);
  return getSetting(key, fallback) || fallback;
}

/** Feature flag — section/page को enable/disable करें */
export function useFeature(key: string, defaultEnabled = true): boolean {
  const { getBoolean } = useContext(SettingsContext);
  return getBoolean(key, defaultEnabled);
}

/** Button control — button को enable/disable करें */
export function useButtonEnabled(key: string): boolean {
  const { getBoolean } = useContext(SettingsContext);
  return getBoolean(key, true);
}

/** Popup settings */
export function usePopupSettings() {
  const { getSetting, getBoolean } = useContext(SettingsContext);
  return {
    enabled: getBoolean("popup.global.enabled", false),
    title: getSetting("popup.global.title", "Important Notice"),
    message: getSetting("popup.global.message", ""),
    type: getSetting("popup.global.type", "info") as "info" | "success" | "warning" | "danger" | "announcement",
    buttonText: getSetting("popup.global.button_text", "Got it!"),
    dismissText: getSetting("popup.global.dismiss_text", "Dismiss"),
    showDismiss: getBoolean("popup.global.show_dismiss", true),
    imageUrl: getSetting("popup.global.image_url", ""),
    target: getSetting("popup.global.target", "all"),
  };
}

/** Announcement banner settings */
export function useAnnouncementBanner() {
  const { getSetting, getBoolean } = useContext(SettingsContext);
  return {
    enabled: getBoolean("announcement.banner.enabled", false),
    message: getSetting("announcement.banner.message", ""),
    type: getSetting("announcement.banner.type", "info") as "info" | "success" | "warning" | "danger",
    dismissible: getBoolean("announcement.banner.dismissible", true),
    link: getSetting("announcement.banner.link", ""),
    linkText: getSetting("announcement.banner.link_text", "Learn More"),
  };
}
