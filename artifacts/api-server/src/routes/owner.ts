import { Router } from "express";

const router = Router();

// ── Mock data ─────────────────────────────────────────────────────────────────

const SEATS = Array.from({ length: 60 }, (_, i) => {
  const row = Math.floor(i / 10) + 1;
  const col = (i % 10) + 1;
  const statusOptions = ["available", "occupied", "occupied", "reserved", "available", "available", "occupied", "maintenance"] as const;
  const categoryOptions = ["standard", "window", "premium"] as const;
  const status = statusOptions[i % statusOptions.length] as string;
  const category = col <= 2 ? "window" : row <= 2 ? "premium" : "standard";
  return {
    id: `seat${i + 1}`,
    number: `${String.fromCharCode(64 + row)}${col}`,
    row,
    col,
    category,
    status,
    studentName: status === "occupied" ? ["Arjun Sharma", "Priya Mehra", "Rahul Das", "Vivek Nair", "Ananya Iyer"][i % 5] : null,
    shiftId: status === "occupied" ? ["shift1", "shift2", "shift3"][i % 3] : null,
  };
});

const OWNER_STUDENTS = [
  { id: "s1", name: "Arjun Sharma", email: "arjun@example.com", phone: "+91 90000 11111", seat: "A1", shift: "Morning (6AM-2PM)", creditsRemaining: 18, planExpiry: "2024-06-30", attendance: 85, status: "active", joinDate: "2024-03-01" },
  { id: "s2", name: "Priya Mehra", email: "priya@example.com", phone: "+91 90000 22222", seat: "B3", shift: "Evening (2PM-10PM)", creditsRemaining: 45, planExpiry: "2024-08-15", attendance: 92, status: "active", joinDate: "2024-02-15" },
  { id: "s4", name: "Sneha Joshi", email: "sneha@example.com", phone: "+91 90000 44444", seat: "D5", shift: "Morning (6AM-2PM)", creditsRemaining: 0, planExpiry: "2024-05-31", attendance: 40, status: "expired", joinDate: "2024-01-20" },
  { id: "s6", name: "Kavya Reddy", email: "kavya@example.com", phone: "+91 90000 66666", seat: "E2", shift: "Evening (2PM-10PM)", creditsRemaining: 10, planExpiry: "2024-06-15", attendance: 55, status: "suspended", joinDate: "2024-03-25" },
  { id: "s9", name: "Deepak Raj", email: "deepak@example.com", phone: "+91 90000 99999", seat: "C4", shift: "Full Day (6AM-10PM)", creditsRemaining: 52, planExpiry: "2024-09-01", attendance: 90, status: "active", joinDate: "2024-04-01" },
  { id: "s10", name: "Meera Pillai", email: "meera@example.com", phone: "+91 90000 10101", seat: "F1", shift: "Morning (6AM-2PM)", creditsRemaining: 28, planExpiry: "2024-07-20", attendance: 76, status: "active", joinDate: "2024-04-20" },
];

const ATTENDANCE_ENTRIES = [
  { id: "ae1", studentName: "Arjun Sharma", seat: "A1", shift: "Morning", entryTime: "09:05", exitTime: "13:02", duration: "3h 57m", status: "present", creditDeducted: 1 },
  { id: "ae2", studentName: "Priya Mehra", seat: "B3", shift: "Evening", entryTime: "14:10", exitTime: null, duration: null, status: "present", creditDeducted: null },
  { id: "ae3", studentName: "Sneha Joshi", seat: "D5", shift: "Morning", entryTime: null, exitTime: null, duration: null, status: "absent", creditDeducted: 1 },
  { id: "ae4", studentName: "Deepak Raj", seat: "C4", shift: "Full Day", entryTime: "09:00", exitTime: "19:55", duration: "10h 55m", status: "present", creditDeducted: 2 },
  { id: "ae5", studentName: "Kavya Reddy", seat: "E2", shift: "Evening", entryTime: null, exitTime: null, duration: null, status: "leave", creditDeducted: 0 },
  { id: "ae6", studentName: "Meera Pillai", seat: "F1", shift: "Morning", entryTime: "09:20", exitTime: "13:00", duration: "3h 40m", status: "present", creditDeducted: 1 },
];

const LEAVE_REQUESTS = [
  { id: "lr1", studentName: "Kavya Reddy", seat: "E2", date: "2024-06-04", reason: "Medical appointment", status: "approved", appliedAt: "2024-06-03T20:00:00Z", creditSaved: 1 },
  { id: "lr2", studentName: "Sneha Joshi", seat: "D5", date: "2024-06-05", reason: "Family function", status: "pending", appliedAt: "2024-06-03T22:00:00Z", creditSaved: null },
  { id: "lr3", studentName: "Arjun Sharma", seat: "A1", date: "2024-06-06", reason: "Exam preparation", status: "pending", appliedAt: "2024-06-04T08:00:00Z", creditSaved: null },
  { id: "lr4", studentName: "Priya Mehra", seat: "B3", date: "2024-06-02", reason: "Travel", status: "rejected", appliedAt: "2024-06-01T18:00:00Z", creditSaved: null },
];

const SHIFTS = [
  { id: "shift1", name: "Morning", startTime: "06:00", endTime: "14:00", capacity: 30, enrolled: 24 },
  { id: "shift2", name: "Evening", startTime: "14:00", endTime: "22:00", capacity: 20, enrolled: 18 },
  { id: "shift3", name: "Full Day", startTime: "06:00", endTime: "22:00", capacity: 10, enrolled: 6 },
];

// ── Owner Stats ───────────────────────────────────────────────────────────────

router.get("/stats", (_req, res) => {
  res.json({
    totalSeats: 60,
    occupiedSeats: 38,
    availableSeats: 17,
    totalStudents: 6,
    activeStudents: 4,
    todayAttendance: 5,
    creditsConsumedToday: 6,
    monthlyRevenue: 72000,
  });
});

// ── Charts ────────────────────────────────────────────────────────────────────

router.get("/charts/attendance", (_req, res) => {
  res.json([
    { day: "Mon", present: 42, absent: 6 },
    { day: "Tue", present: 45, absent: 3 },
    { day: "Wed", present: 38, absent: 10 },
    { day: "Thu", present: 46, absent: 2 },
    { day: "Fri", present: 44, absent: 4 },
    { day: "Sat", present: 50, absent: 0 },
    { day: "Sun", present: 35, absent: 13 },
  ]);
});

router.get("/charts/seat-occupancy", (_req, res) => {
  res.json([
    { shift: "Morning", occupied: 24, available: 6 },
    { shift: "Evening", occupied: 18, available: 2 },
    { shift: "Full Day", occupied: 6, available: 4 },
  ]);
});

// ── Seats ─────────────────────────────────────────────────────────────────────

router.get("/seats", (_req, res) => {
  res.json(SEATS);
});

router.post("/seats", (req, res) => {
  const { number, row, col, category } = req.body;
  const seat = { id: `seat${Date.now()}`, number, row, col, category, status: "available", studentName: null, shiftId: null };
  SEATS.push(seat as typeof SEATS[number]);
  res.status(201).json(seat);
});

router.patch("/seats/:id", (req, res) => {
  const seat = SEATS.find((s) => s.id === req.params["id"]);
  if (!seat) { res.status(404).json({ error: "Not found" }); return; }
  const { status, studentName } = req.body;
  if (status !== undefined) seat.status = status;
  if (studentName !== undefined) seat.studentName = studentName;
  res.json(seat);
});

// ── Students ─────────────────────────────────────────────────────────────────

router.get("/students", (req, res) => {
  let students = [...OWNER_STUDENTS];
  const { search, status } = req.query;
  if (status && typeof status === "string") {
    students = students.filter((s) => s.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    students = students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  res.json(students);
});

// ── Attendance ────────────────────────────────────────────────────────────────

router.get("/attendance", (_req, res) => {
  res.json(ATTENDANCE_ENTRIES);
});

// ── Leaves ────────────────────────────────────────────────────────────────────

router.get("/leaves", (_req, res) => {
  res.json(LEAVE_REQUESTS);
});

router.patch("/leaves/:id/approve", (req, res) => {
  const leave = LEAVE_REQUESTS.find((l) => l.id === req.params["id"]);
  if (!leave) { res.status(404).json({ error: "Not found" }); return; }
  leave.status = "approved";
  leave.creditSaved = 1;
  res.json(leave);
});

router.patch("/leaves/:id/reject", (req, res) => {
  const leave = LEAVE_REQUESTS.find((l) => l.id === req.params["id"]);
  if (!leave) { res.status(404).json({ error: "Not found" }); return; }
  leave.status = "rejected";
  res.json(leave);
});

// ── Credits ───────────────────────────────────────────────────────────────────

router.post("/credits/adjust", (req, res) => {
  const { studentId, amount } = req.body;
  const student = OWNER_STUDENTS.find((s) => s.id === studentId);
  if (!student) { res.status(404).json({ error: "Not found" }); return; }
  student.creditsRemaining = Math.max(0, student.creditsRemaining + amount);
  res.json(student);
});

// ── Shifts ────────────────────────────────────────────────────────────────────

router.get("/shifts", (_req, res) => {
  res.json(SHIFTS);
});

router.post("/shifts", (req, res) => {
  const { name, startTime, endTime, capacity } = req.body;
  const shift = { id: `shift${Date.now()}`, name, startTime, endTime, capacity: capacity ?? null, enrolled: 0 };
  SHIFTS.push(shift);
  res.status(201).json(shift);
});

export default router;
