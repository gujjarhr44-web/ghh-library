import { Router } from "express";
import { logger } from "../lib/logger";
import { bookingRepo } from "../lib/db-repo";

const router = Router();

// ── 1. POST /api/bookings/reserve (Rule #64: Concurrency-Protected Booking) ───
router.post("/reserve", async (req, res) => {
  const {
    userId,
    studentName,
    libraryId,
    seatId,
    seatNumber,
    shiftId,
    shiftName,
    bookingDate,
    startTime,
  } = req.body;

  if (!seatId || !shiftId) {
    return res.status(400).json({ success: false, message: "Seat and shift are required" });
  }

  try {
    const result = await bookingRepo.reserveSeat({
      userId: userId || "u001",
      studentName: studentName || "Student",
      libraryId: libraryId || "lib001",
      seatId,
      seatNumber: seatNumber || "Seat",
      shiftId,
      shiftName: shiftName || "Shift",
      bookingDate: bookingDate || new Date().toISOString().split("T")[0],
      startTime: startTime || "06:00 AM",
    });

    return res.status(201).json(result);
  } catch (err: any) {
    logger.warn({ err: err.message, seatId, shiftId, bookingDate }, "Seat booking conflict");
    return res.status(409).json({ success: false, message: err.message || "Seat is already reserved" });
  }
});

// ── 2. POST /api/bookings/waitlist/join ──────────────────────────────────────
router.post("/waitlist/join", async (req, res) => {
  const { userId, studentName, libraryId, shiftId, shiftName, bookingDate } = req.body;

  if (!shiftId) {
    return res.status(400).json({ success: false, message: "Shift is required to join waitlist" });
  }

  try {
    const entry = await bookingRepo.joinWaitlist({
      userId: userId || "u001",
      studentName: studentName || "Student",
      libraryId: libraryId || "lib001",
      shiftId,
      shiftName: shiftName || "Shift",
      bookingDate: bookingDate || new Date().toISOString().split("T")[0],
    });

    return res.status(201).json({
      success: true,
      position: entry.queuePosition,
      message: `You are #${entry.queuePosition} in the waitlist queue.`,
      entry,
    });
  } catch (err: any) {
    logger.error({ err }, "Error joining waitlist");
    return res.status(500).json({ success: false, message: "Failed to join waitlist" });
  }
});

// ── 3. GET /api/bookings/my (Student Bookings) ────────────────────────────────
router.get("/my", async (req, res) => {
  const userId = (req.query["userId"] as string) || "";
  const list = await bookingRepo.listByUser(userId);
  res.json(list);
});

// ── 4. GET /api/bookings/waitlist/:libraryId (Owner Waitlist Queue) ───────────
router.get("/waitlist/:libraryId", async (req, res) => {
  const list = await bookingRepo.getWaitlist(req.params["libraryId"]);
  res.json(list);
});

// ── 5. POST /api/bookings/:id/cancel (Cancel Seat Reservation) ────────────────
router.post("/:id/cancel", async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await bookingRepo.cancelBooking(req.params["id"], userId);
    return res.json(result);
  } catch (err: any) {
    logger.error({ err, bookingId: req.params["id"] }, "Error cancelling booking");
    return res.status(400).json({ success: false, message: err.message || "Failed to cancel booking" });
  }
});

export default router;
