/**
 * CMS Settings Store — In-memory store with WebSocket broadcast support
 * Admin Control Panel की सभी settings यहाँ manage होती हैं
 */

export type SettingType = "boolean" | "text" | "color" | "number" | "json" | "select";
export type SettingCategory = "texts" | "buttons" | "features" | "theme" | "popups" | "announcements" | "data";

export interface AppSetting {
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description?: string;
  options?: string[]; // for select type
  updatedAt: string;
}

// ── WebSocket broadcaster ──────────────────────────────────────────────────────
type BroadcastFn = (event: string, data: unknown) => void;
let _broadcast: BroadcastFn = () => {};

export function registerBroadcast(fn: BroadcastFn) {
  _broadcast = fn;
}

function broadcast(event: string, data: unknown) {
  _broadcast(event, data);
}

// ── Default Settings ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: AppSetting[] = [
  // ── TEXTS ──
  { key: "app.title", value: "GHH Library Manager", type: "text", category: "texts", label: "App Title", description: "Browser tab और header में दिखता है" },
  { key: "app.subtitle", value: "Smart Library Management System", type: "text", category: "texts", label: "App Subtitle" },
  { key: "login.title", value: "Welcome Back", type: "text", category: "texts", label: "Login Page Title" },
  { key: "login.subtitle", value: "Sign in to your account", type: "text", category: "texts", label: "Login Subtitle" },
  { key: "login.button", value: "Sign In", type: "text", category: "texts", label: "Login Button Text" },
  { key: "dashboard.greeting", value: "Good Morning", type: "text", category: "texts", label: "Dashboard Greeting" },
  { key: "dashboard.welcome_text", value: "Here's what's happening in your libraries today", type: "text", category: "texts", label: "Dashboard Welcome Text" },
  { key: "sidebar.home_label", value: "Dashboard", type: "text", category: "texts", label: "Sidebar - Home Label" },
  { key: "sidebar.libraries_label", value: "Libraries", type: "text", category: "texts", label: "Sidebar - Libraries Label" },
  { key: "sidebar.students_label", value: "Students", type: "text", category: "texts", label: "Sidebar - Students Label" },
  { key: "sidebar.payments_label", value: "Payments", type: "text", category: "texts", label: "Sidebar - Payments Label" },
  { key: "sidebar.attendance_label", value: "Attendance", type: "text", category: "texts", label: "Sidebar - Attendance Label" },
  { key: "sidebar.notifications_label", value: "Notifications", type: "text", category: "texts", label: "Sidebar - Notifications Label" },
  { key: "sidebar.settings_label", value: "Settings", type: "text", category: "texts", label: "Sidebar - Settings Label" },
  { key: "sidebar.control_panel_label", value: "Control Panel", type: "text", category: "texts", label: "Sidebar - Control Panel Label" },
  { key: "owner.welcome_message", value: "Find Your Perfect Study Space", type: "text", category: "texts", label: "Owner App - Welcome Message" },
  { key: "owner.welcome_subheading", value: "Book seats, track attendance, and achieve your academic goals.", type: "text", category: "texts", label: "Owner App - Welcome Subheading" },
  { key: "owner.book_seat_btn", value: "Book Seat", type: "text", category: "texts", label: "Owner App - Book Seat Button" },
  { key: "owner.mark_attendance_btn", value: "Mark Attendance", type: "text", category: "texts", label: "Owner App - Mark Attendance Button" },
  { key: "owner.apply_leave_btn", value: "Apply for Leave", type: "text", category: "texts", label: "Owner App - Apply Leave Button" },
  { key: "owner.purchase_plan_btn", value: "Purchase Plan", type: "text", category: "texts", label: "Owner App - Purchase Plan Button" },
  { key: "footer.copyright", value: "© 2025 GHH Library. All rights reserved.", type: "text", category: "texts", label: "Footer Copyright Text" },

  // ── BUTTONS ──
  { key: "btn.approve_library", value: "true", type: "boolean", category: "buttons", label: "Approve Library Button", description: "Library approve button enable/disable करें" },
  { key: "btn.reject_library", value: "true", type: "boolean", category: "buttons", label: "Reject Library Button" },
  { key: "btn.suspend_library", value: "true", type: "boolean", category: "buttons", label: "Suspend Library Button" },
  { key: "btn.send_notification", value: "true", type: "boolean", category: "buttons", label: "Send Notification Button" },
  { key: "btn.adjust_credits", value: "true", type: "boolean", category: "buttons", label: "Adjust Credits Button" },
  { key: "btn.approve_leave", value: "true", type: "boolean", category: "buttons", label: "Approve Leave Button" },
  { key: "btn.reject_leave", value: "true", type: "boolean", category: "buttons", label: "Reject Leave Button" },
  { key: "btn.update_seat", value: "true", type: "boolean", category: "buttons", label: "Update Seat Status Button" },
  { key: "btn.export_data", value: "true", type: "boolean", category: "buttons", label: "Export Data Button" },
  { key: "btn.book_seat", value: "true", type: "boolean", category: "buttons", label: "Owner - Book Seat Button" },
  { key: "btn.mark_attendance", value: "true", type: "boolean", category: "buttons", label: "Owner - Mark Attendance Button" },
  { key: "btn.apply_leave", value: "true", type: "boolean", category: "buttons", label: "Owner - Apply Leave Button" },
  { key: "btn.purchase_plan", value: "true", type: "boolean", category: "buttons", label: "Owner - Purchase Plan Button" },
  { key: "btn.login", value: "true", type: "boolean", category: "buttons", label: "Login Button" },

  // ── FEATURES ──
  { key: "feature.payments_page", value: "true", type: "boolean", category: "features", label: "Payments Page", description: "Payments section दिखाएं/छुपाएं" },
  { key: "feature.attendance_page", value: "true", type: "boolean", category: "features", label: "Attendance Page" },
  { key: "feature.leaves_page", value: "true", type: "boolean", category: "features", label: "Leaves Management Page" },
  { key: "feature.shifts_page", value: "true", type: "boolean", category: "features", label: "Shifts Management Page" },
  { key: "feature.notifications_page", value: "true", type: "boolean", category: "features", label: "Notifications Page" },
  { key: "feature.quick_stats", value: "true", type: "boolean", category: "features", label: "Quick Stats Section" },
  { key: "feature.achievements", value: "true", type: "boolean", category: "features", label: "Achievements Section" },
  { key: "feature.facilities", value: "true", type: "boolean", category: "features", label: "Facilities Section" },
  { key: "feature.charts", value: "true", type: "boolean", category: "features", label: "Charts & Analytics" },
  { key: "feature.dark_mode_toggle", value: "true", type: "boolean", category: "features", label: "Dark Mode Toggle" },
  { key: "feature.export_buttons", value: "true", type: "boolean", category: "features", label: "Export/Download Buttons" },
  { key: "feature.search_bars", value: "true", type: "boolean", category: "features", label: "Search Bars" },
  { key: "feature.filters", value: "true", type: "boolean", category: "features", label: "Filter Controls" },

  // ── THEME ──
  { key: "theme.primary_color", value: "#6366f1", type: "color", category: "theme", label: "Primary Color" },
  { key: "theme.secondary_color", value: "#f59e0b", type: "color", category: "theme", label: "Secondary Color" },
  { key: "theme.danger_color", value: "#ef4444", type: "color", category: "theme", label: "Danger/Error Color" },
  { key: "theme.success_color", value: "#22c55e", type: "color", category: "theme", label: "Success Color" },
  { key: "theme.sidebar_bg", value: "#1e1b4b", type: "color", category: "theme", label: "Sidebar Background Color" },
  { key: "theme.font_family", value: "Inter", type: "select", category: "theme", label: "Font Family", options: ["Inter", "Roboto", "Poppins", "Outfit", "Nunito", "DM Sans"] },
  { key: "theme.font_size", value: "medium", type: "select", category: "theme", label: "Font Size", options: ["small", "medium", "large"] },
  { key: "theme.border_radius", value: "medium", type: "select", category: "theme", label: "Border Radius", options: ["none", "small", "medium", "large", "full"] },
  { key: "theme.mode", value: "light", type: "select", category: "theme", label: "App Theme Mode", options: ["light", "dark", "system"] },
  { key: "theme.logo_text", value: "GHH", type: "text", category: "theme", label: "Logo Text/Initials" },

  // ── POPUPS ──
  { key: "popup.global.enabled", value: "false", type: "boolean", category: "popups", label: "Global Popup Enable", description: "सभी users को popup दिखाएं" },
  { key: "popup.global.title", value: "Important Notice", type: "text", category: "popups", label: "Global Popup Title" },
  { key: "popup.global.message", value: "We are introducing new facilities soon!", type: "text", category: "popups", label: "Global Popup Message" },
  { key: "popup.global.type", value: "info", type: "select", category: "popups", label: "Global Popup Type", options: ["info", "success", "warning", "danger", "announcement"] },
  { key: "popup.global.button_text", value: "Got it!", type: "text", category: "popups", label: "Global Popup Button Text" },
  { key: "popup.global.dismiss_text", value: "Dismiss", type: "text", category: "popups", label: "Global Popup Dismiss Text" },
  { key: "popup.global.show_dismiss", value: "true", type: "boolean", category: "popups", label: "Show Dismiss Button" },
  { key: "popup.global.image_url", value: "", type: "text", category: "popups", label: "Global Popup Image URL" },
  { key: "popup.global.target", value: "all", type: "select", category: "popups", label: "Popup Target", options: ["all", "super-admin", "library-owner"] },
  { key: "popup.maintenance.enabled", value: "false", type: "boolean", category: "popups", label: "Maintenance Mode Popup" },
  { key: "popup.maintenance.message", value: "System is under maintenance. Please try again later.", type: "text", category: "popups", label: "Maintenance Message" },

  // ── ANNOUNCEMENTS ──
  { key: "announcement.banner.enabled", value: "false", type: "boolean", category: "announcements", label: "Top Banner Enable", description: "सभी pages पर top banner दिखाएं" },
  { key: "announcement.banner.message", value: "🎉 New features are live! Check out the latest updates.", type: "text", category: "announcements", label: "Banner Message" },
  { key: "announcement.banner.type", value: "info", type: "select", category: "announcements", label: "Banner Type", options: ["info", "success", "warning", "danger"] },
  { key: "announcement.banner.dismissible", value: "true", type: "boolean", category: "announcements", label: "Banner Dismissible" },
  { key: "announcement.banner.link", value: "", type: "text", category: "announcements", label: "Banner Link URL" },
  { key: "announcement.banner.link_text", value: "Learn More", type: "text", category: "announcements", label: "Banner Link Text" },

  // ── WIFI ATTENDANCE ──
  { key: "wifi.ssid", value: "GHH_Library_WiFi", type: "text", category: "data", label: "Library Wi-Fi SSID", description: "Wifi name configured for auto-attendance" },

  // ── PAYMENT CONFIG ──
  { key: "payment.qr_upi_uri", value: "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00", type: "text", category: "data", label: "Payment UPI URI / QR Data", description: "UPI payment link parsed for QR scanner during purchase (upi://pay?...)" },
];

// ── Settings Store ────────────────────────────────────────────────────────────
const settingsMap = new Map<string, AppSetting>();

// Initialize with defaults
DEFAULT_SETTINGS.forEach((s) => {
  settingsMap.set(s.key, { ...s, updatedAt: new Date().toISOString() });
});

// ── CRUD Operations ───────────────────────────────────────────────────────────

export function getAllSettings(): AppSetting[] {
  return Array.from(settingsMap.values());
}

export function getSettingsByCategory(category: SettingCategory): AppSetting[] {
  return Array.from(settingsMap.values()).filter((s) => s.category === category);
}

export function getSetting(key: string): AppSetting | undefined {
  return settingsMap.get(key);
}

export function getSettingValue(key: string, defaultVal = ""): string {
  return settingsMap.get(key)?.value ?? defaultVal;
}

export function setBooleanValue(key: string): boolean {
  return getSettingValue(key, "true") === "true";
}

export function updateSetting(key: string, value: string): AppSetting {
  const existing = settingsMap.get(key);
  const updated: AppSetting = existing
    ? { ...existing, value, updatedAt: new Date().toISOString() }
    : {
        key,
        value,
        type: "text",
        category: "texts",
        label: key,
        updatedAt: new Date().toISOString(),
      };

  settingsMap.set(key, updated);

  // Broadcast live update to all connected WebSocket clients
  broadcast("settings:update", { key, value, setting: updated });

  return updated;
}

export function bulkUpdateSettings(updates: Record<string, string>): AppSetting[] {
  const updated: AppSetting[] = [];
  for (const [key, value] of Object.entries(updates)) {
    updated.push(updateSetting(key, value));
  }
  // Broadcast all at once
  broadcast("settings:bulk_update", { settings: getAllSettings() });
  return updated;
}

export function deleteSetting(key: string): boolean {
  const existed = settingsMap.has(key);
  settingsMap.delete(key);
  if (existed) broadcast("settings:delete", { key });
  return existed;
}

export function resetToDefaults(): void {
  settingsMap.clear();
  DEFAULT_SETTINGS.forEach((s) => {
    settingsMap.set(s.key, { ...s, updatedAt: new Date().toISOString() });
  });
  broadcast("settings:reset", { settings: getAllSettings() });
}

// Legacy compatibility — map old SETTINGS format to new keys
export function getLegacySettings() {
  return {
    appTitle: getSettingValue("app.title", "GHH Library Manager"),
    welcomeMessage: getSettingValue("owner.welcome_message", "Find Your Perfect Study Space"),
    welcomeSubheading: getSettingValue("owner.welcome_subheading", "Book seats, track attendance, and achieve your academic goals."),
    themeColor: getSettingValue("theme.primary_color", "#6366f1"),
    isBookSeatClickable: setBooleanValue("btn.book_seat"),
    isMarkAttendanceClickable: setBooleanValue("btn.mark_attendance"),
    isApplyLeaveClickable: setBooleanValue("btn.apply_leave"),
    isPurchasePlanClickable: setBooleanValue("btn.purchase_plan"),
    showAchievements: setBooleanValue("feature.achievements"),
    showQuickStats: setBooleanValue("feature.quick_stats"),
    showFacilities: setBooleanValue("feature.facilities"),
    showPopup: setBooleanValue("popup.global.enabled"),
    popupScreen: getSettingValue("popup.global.target", "any"),
    popupTitle: getSettingValue("popup.global.title", "Important Notice"),
    popupMessage: getSettingValue("popup.global.message", "We are introducing new facilities soon!"),
    popupMediaUrl: getSettingValue("popup.global.image_url", ""),
    popupPromptPlaceholder: "",
    popupPrimaryButtonText: getSettingValue("popup.global.button_text", "Okay"),
    popupSecondaryButtonText: getSettingValue("popup.global.dismiss_text", "Dismiss"),
    wifiSSID: getSettingValue("wifi.ssid", "GHH_Library_WiFi"),
    paymentQR: getSettingValue("payment.qr_upi_uri", "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00"),
  };
}
