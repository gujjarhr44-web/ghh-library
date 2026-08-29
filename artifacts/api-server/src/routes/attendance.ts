import { Router } from "express";
import { logger } from "../lib/logger";
import { attendanceRepo } from "../lib/db-repo";

const router = Router();

// ── 1. POST /api/attendance/punch-in (Rule #63, #75: ACID QR Attendance) ─────
router.post("/punch-in", async (req, res) => {
  const {
    userId,
    studentName,
    libraryId,
    libraryName,
    seatNumber,
    shiftName,
    entryMethod,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const record = await attendanceRepo.punchIn({
      userId,
      studentName: studentName || "Student",
      libraryId: libraryId || "lib001",
      libraryName: libraryName || "GHH Central Library",
      seatNumber,
      shiftName: shiftName || "Morning",
      entryMethod: entryMethod || "qr",
    });

    logger.info({ attendanceId: record.id, userId, entryTime: record.entryTime }, "Attendance punched in successfully");

    return res.status(201).json({
      success: true,
      message: `Welcome ${studentName || "Student"}! Entry marked at ${record.entryTime}. 1 credit deducted.`,
      record,
    });
  } catch (err: any) {
    logger.error({ err }, "Error recording punch-in");
    return res.status(500).json({ success: false, message: err.message || "Failed to mark attendance" });
  }
});

// ── 2. POST /api/attendance/punch-out (Rule #75: Smart Exit Punch) ────────────
router.post("/punch-out", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const record = await attendanceRepo.punchOut(userId);
    logger.info({ attendanceId: record.id, userId, exitTime: record.exitTime }, "Attendance punched out");

    return res.json({
      success: true,
      message: `Goodbye! Exit marked at ${record.exitTime}. Have a great day!`,
      record,
    });
  } catch (err: any) {
    logger.warn({ err: err.message, userId }, "Exit punch validation failed");
    return res.status(400).json({ success: false, message: err.message || "No active session found" });
  }
});

// ── 3. GET /api/attendance/my (Student Attendance Records) ───────────────────
router.get("/my", async (req, res) => {
  const userId = (req.query["userId"] as string) || "";
  const records = await attendanceRepo.listByUser(userId);
  res.json(records);
});

// ── 4. GET /api/attendance/today/:libraryId (Live Attendance for Library) ────
router.get("/today/:libraryId", async (req, res) => {
  const records = await attendanceRepo.listByLibraryToday(req.params["libraryId"]);
  res.json(records);
});

// ── 5. GET /api/attendance/unchecked-out (Students still inside) ──────────────
router.get("/unchecked-out", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "lib001";
  const records = await attendanceRepo.listByLibraryToday(libraryId);
  const activeStudents = records.filter((r) => !r.exitTime && r.status === "present");
  res.json(activeStudents);
});

export default router;
