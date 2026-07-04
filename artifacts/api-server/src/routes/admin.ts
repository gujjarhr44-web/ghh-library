import { Router } from "express";

const router = Router();

// ── Mock data ─────────────────────────────────────────────────────────────────

const LIBRARIES = [
  { id: "lib1", name: "GHH Central Library", ownerName: "Priya Patel", mobile: "+91 98765 43210", city: "Mumbai", area: "Andheri West", totalSeats: 60, activeStudents: 48, status: "approved", registrationDate: "2024-01-15", monthlyRevenue: 72000, occupancyRate: 80, facilities: ["Wi-Fi", "AC", "Parking", "Cafeteria", "Lockers"] },
  { id: "lib2", name: "StudySpace Premium", ownerName: "Amit Sharma", mobile: "+91 87654 32109", city: "Pune", area: "Koregaon Park", totalSeats: 40, activeStudents: 32, status: "approved", registrationDate: "2024-02-20", monthlyRevenue: 48000, occupancyRate: 75, facilities: ["Wi-Fi", "AC", "Whiteboards"] },
  { id: "lib3", name: "Focus Zone Library", ownerName: "Ravi Kumar", mobile: "+91 76543 21098", city: "Bangalore", area: "Indiranagar", totalSeats: 50, activeStudents: 38, status: "pending", registrationDate: "2024-05-10", monthlyRevenue: 0, occupancyRate: 0, facilities: ["Wi-Fi", "AC"] },
  { id: "lib4", name: "Scholar's Den", ownerName: "Neha Singh", mobile: "+91 65432 10987", city: "Delhi", area: "Connaught Place", totalSeats: 35, activeStudents: 10, status: "suspended", registrationDate: "2024-03-05", monthlyRevenue: 12000, occupancyRate: 28, facilities: ["Wi-Fi"] },
  { id: "lib5", name: "Knowledgehub", ownerName: "Suresh Verma", mobile: "+91 55432 10988", city: "Hyderabad", area: "Banjara Hills", totalSeats: 45, activeStudents: 40, status: "approved", registrationDate: "2024-04-01", monthlyRevenue: 60000, occupancyRate: 89, facilities: ["Wi-Fi", "AC", "Cafeteria"] },
];

const STUDENTS = [
  { id: "s1", name: "Arjun Sharma", email: "arjun@example.com", mobile: "+91 90000 11111", library: "GHH Central Library", seat: "A1", plan: "Monthly", creditsRemaining: 18, attendancePercent: 85, status: "active", joinDate: "2024-03-01" },
  { id: "s2", name: "Priya Mehra", email: "priya@example.com", mobile: "+91 90000 22222", library: "GHH Central Library", seat: "B3", plan: "Quarterly", creditsRemaining: 45, attendancePercent: 92, status: "active", joinDate: "2024-02-15" },
  { id: "s3", name: "Rahul Das", email: "rahul@example.com", mobile: "+91 90000 33333", library: "StudySpace Premium", seat: "C2", plan: "Monthly", creditsRemaining: 3, attendancePercent: 65, status: "active", joinDate: "2024-04-10" },
  { id: "s4", name: "Sneha Joshi", email: "sneha@example.com", mobile: "+91 90000 44444", library: "GHH Central Library", seat: "D5", plan: "Monthly", creditsRemaining: 0, attendancePercent: 40, status: "expired", joinDate: "2024-01-20" },
  { id: "s5", name: "Vivek Nair", email: "vivek@example.com", mobile: "+91 90000 55555", library: "Knowledgehub", seat: "A4", plan: "Quarterly", creditsRemaining: 55, attendancePercent: 78, status: "active", joinDate: "2024-05-01" },
  { id: "s6", name: "Kavya Reddy", email: "kavya@example.com", mobile: "+91 90000 66666", library: "GHH Central Library", seat: "E2", plan: "Monthly", creditsRemaining: 10, attendancePercent: 55, status: "suspended", joinDate: "2024-03-25" },
  { id: "s7", name: "Nikhil Patil", email: "nikhil@example.com", mobile: "+91 90000 77777", library: "StudySpace Premium", seat: "B1", plan: "Monthly", creditsRemaining: 22, attendancePercent: 88, status: "active", joinDate: "2024-04-15" },
  { id: "s8", name: "Ananya Iyer", email: "ananya@example.com", mobile: "+91 90000 88888", library: "Knowledgehub", seat: "C3", plan: "Quarterly", creditsRemaining: 60, attendancePercent: 95, status: "active", joinDate: "2024-02-01" },
];

const PAYMENTS = [
  { id: "p1", transactionId: "TXN001234", studentName: "Arjun Sharma", libraryName: "GHH Central Library", amount: 1299, method: "UPI", date: "2024-06-01", status: "success" },
  { id: "p2", transactionId: "TXN001235", studentName: "Priya Mehra", libraryName: "GHH Central Library", amount: 3499, method: "Card", date: "2024-06-01", status: "success" },
  { id: "p3", transactionId: "TXN001236", studentName: "Rahul Das", libraryName: "StudySpace Premium", amount: 1299, method: "UPI", date: "2024-05-30", status: "success" },
  { id: "p4", transactionId: "TXN001237", studentName: "Sneha Joshi", libraryName: "GHH Central Library", amount: 1299, method: "Net Banking", date: "2024-05-28", status: "failed" },
  { id: "p5", transactionId: "TXN001238", studentName: "Vivek Nair", libraryName: "Knowledgehub", amount: 3499, method: "UPI", date: "2024-05-25", status: "success" },
  { id: "p6", transactionId: "TXN001239", studentName: "Ananya Iyer", libraryName: "Knowledgehub", amount: 3499, method: "Card", date: "2024-05-20", status: "success" },
  { id: "p7", transactionId: "TXN001240", studentName: "Nikhil Patil", libraryName: "StudySpace Premium", amount: 1299, method: "UPI", date: "2024-05-18", status: "success" },
  { id: "p8", transactionId: "TXN001241", studentName: "Kavya Reddy", libraryName: "GHH Central Library", amount: 1299, method: "UPI", date: "2024-05-15", status: "refunded" },
];

const ATTENDANCE_LOGS = [
  { id: "al1", studentName: "Arjun Sharma", library: "GHH Central Library", date: "2024-06-04", entryTime: "09:05", exitTime: "13:00", shift: "Morning", status: "present", creditsDeducted: 1 },
  { id: "al2", studentName: "Priya Mehra", library: "GHH Central Library", date: "2024-06-04", entryTime: "09:10", exitTime: null, shift: "Morning", status: "present", creditsDeducted: null },
  { id: "al3", studentName: "Rahul Das", library: "StudySpace Premium", date: "2024-06-04", entryTime: "14:05", exitTime: "18:00", shift: "Afternoon", status: "present", creditsDeducted: 1 },
  { id: "al4", studentName: "Sneha Joshi", library: "GHH Central Library", date: "2024-06-04", entryTime: null, exitTime: null, shift: "Morning", status: "absent", creditsDeducted: 1 },
  { id: "al5", studentName: "Vivek Nair", library: "Knowledgehub", date: "2024-06-04", entryTime: "09:15", exitTime: "13:10", shift: "Morning", status: "late", creditsDeducted: 1 },
  { id: "al6", studentName: "Kavya Reddy", library: "GHH Central Library", date: "2024-06-04", entryTime: null, exitTime: null, shift: "Afternoon", status: "leave", creditsDeducted: 0 },
  { id: "al7", studentName: "Ananya Iyer", library: "Knowledgehub", date: "2024-06-04", entryTime: "09:02", exitTime: "18:05", shift: "Full Day", status: "present", creditsDeducted: 2 },
  { id: "al8", studentName: "Nikhil Patil", library: "StudySpace Premium", date: "2024-06-04", entryTime: "09:08", exitTime: "13:00", shift: "Morning", status: "present", creditsDeducted: 1 },
];

const NOTIFICATIONS: Array<{ id: string; title: string; message: string; target: string; targetId: string | null; sentAt: string; type: string }> = [
  { id: "n1", title: "Platform Maintenance", message: "The platform will be under maintenance on June 10 from 2 AM to 4 AM.", target: "all", targetId: null, sentAt: "2024-06-03T10:00:00Z", type: "alert" },
  { id: "n2", title: "Summer Special Offer", message: "Get 20% bonus credits on all quarterly plans this month!", target: "all", targetId: null, sentAt: "2024-06-01T09:00:00Z", type: "promotion" },
  { id: "n3", title: "New Library Approved", message: "Knowledgehub in Hyderabad is now approved and accepting students.", target: "all", targetId: null, sentAt: "2024-05-28T11:00:00Z", type: "announcement" },
];

// ── Admin Stats ──────────────────────────────────────────────────────────────

router.get("/stats", (_req, res) => {
  res.json({
    totalLibraries: 5,
    activeLibraries: 3,
    pendingApprovals: 1,
    totalStudents: 168,
    activeStudents: 142,
    dailyAttendance: 127,
    monthlyAttendance: 2860,
    totalSeats: 230,
    occupiedSeats: 168,
    availableSeats: 62,
    totalRevenue: 428500,
    monthlyRevenue: 192000,
    dailyNewRegistrations: 4,
  });
});

// ── Chart data ──────────────────────────────────────────────────────────────

router.get("/charts/student-growth", (_req, res) => {
  res.json([
    { month: "Jan", value: 42, secondary: 38 },
    { month: "Feb", value: 68, secondary: 60 },
    { month: "Mar", value: 95, secondary: 85 },
    { month: "Apr", value: 118, secondary: 105 },
    { month: "May", value: 145, secondary: 130 },
    { month: "Jun", value: 168, secondary: 142 },
  ]);
});

router.get("/charts/attendance-trend", (_req, res) => {
  res.json([
    { month: "Jan", value: 1240 },
    { month: "Feb", value: 1580 },
    { month: "Mar", value: 2100 },
    { month: "Apr", value: 2350 },
    { month: "May", value: 2680 },
    { month: "Jun", value: 2860 },
  ]);
});

router.get("/charts/revenue-trend", (_req, res) => {
  res.json([
    { month: "Jan", value: 52000 },
    { month: "Feb", value: 84000 },
    { month: "Mar", value: 125000 },
    { month: "Apr", value: 158000 },
    { month: "May", value: 182000 },
    { month: "Jun", value: 192000 },
  ]);
});

// ── Libraries ────────────────────────────────────────────────────────────────

router.get("/libraries", (req, res) => {
  let libs = [...LIBRARIES];
  const { status, search } = req.query;
  if (status && typeof status === "string") {
    libs = libs.filter((l) => l.status === status);
  }
  if (search && typeof search === "string") {
    const s = search.toLowerCase();
    libs = libs.filter((l) => l.name.toLowerCase().includes(s) || l.ownerName.toLowerCase().includes(s) || l.city.toLowerCase().includes(s));
  }
  res.json(libs);
});

router.get("/libraries/:id", (req, res) => {
  const lib = LIBRARIES.find((l) => l.id === req.params["id"]);
  if (!lib) { res.status(404).json({ error: "Not found" }); return; }
  res.json(lib);
});

router.patch("/libraries/:id", (req, res) => {
  const lib = LIBRARIES.find((l) => l.id === req.params["id"]);
  if (!lib) { res.status(404).json({ error: "Not found" }); return; }
  const { status } = req.body;
  if (status) (lib as typeof lib & { status: string }).status = status;
  res.json(lib);
});

// ── Students ─────────────────────────────────────────────────────────────────

router.get("/students", (req, res) => {
  let students = [...STUDENTS];
  const { library, status, search } = req.query;
  if (library && typeof library === "string") {
    students = students.filter((s) => s.library === library);
  }
  if (status && typeof status === "string") {
    students = students.filter((s) => s.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    students = students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  res.json(students);
});

// ── Payments ─────────────────────────────────────────────────────────────────

router.get("/payments", (_req, res) => {
  res.json(PAYMENTS);
});

// ── Attendance ───────────────────────────────────────────────────────────────

router.get("/attendance", (req, res) => {
  let logs = [...ATTENDANCE_LOGS];
  const { library } = req.query;
  if (library && typeof library === "string") {
    logs = logs.filter((l) => l.library === library);
  }
  res.json(logs);
});

// ── Notifications ────────────────────────────────────────────────────────────

router.get("/notifications", (_req, res) => {
  res.json(NOTIFICATIONS);
});

router.post("/notifications", (req, res) => {
  const { title, message, target, targetId, type } = req.body;
  const notif = {
    id: `n${Date.now()}`,
    title,
    message,
    target,
    targetId: targetId ?? null,
    sentAt: new Date().toISOString(),
    type,
  };
  NOTIFICATIONS.unshift(notif);
  res.status(201).json(notif);
});

import { getLegacySettings, updateSetting, bulkUpdateSettings } from "../lib/cms-store";

router.get("/settings", (_req, res) => {
  res.json(getLegacySettings());
});

router.post("/settings", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const keyMap: Record<string, string> = {
    appTitle: "app.title",
    welcomeMessage: "owner.welcome_message",
    welcomeSubheading: "owner.welcome_subheading",
    themeColor: "theme.primary_color",
    isBookSeatClickable: "btn.book_seat",
    isMarkAttendanceClickable: "btn.mark_attendance",
    isApplyLeaveClickable: "btn.apply_leave",
    isPurchasePlanClickable: "btn.purchase_plan",
    showAchievements: "feature.achievements",
    showQuickStats: "feature.quick_stats",
    showFacilities: "feature.facilities",
    showPopup: "popup.global.enabled",
    popupScreen: "popup.global.target",
    popupTitle: "popup.global.title",
    popupMessage: "popup.global.message",
    popupMediaUrl: "popup.global.image_url",
    popupPrimaryButtonText: "popup.global.button_text",
    popupSecondaryButtonText: "popup.global.dismiss_text",
    wifiSSID: "wifi.ssid",
    paymentQR: "payment.qr_upi_uri",
  };
  const updates: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    const cmsKey = keyMap[k];
    if (cmsKey) updates[cmsKey] = String(v);
  }
  bulkUpdateSettings(updates);
  res.json(getLegacySettings());
});

export default router;
