import { Router } from "express";
import { logger } from "../lib/logger";
import { userRepo } from "../lib/db-repo";

const router = Router();

// ── GET /api/student/leaves ──────────────────────────────────────────────────
router.get("/leaves", async (_req, res) => {
  res.json({ success: true, leaves: [] });
});

// ── POST /api/student/leave ──────────────────────────────────────────────────
router.post("/leave", async (req, res) => {
  const { userId, date, reason } = req.body as { userId?: string; date?: string; reason?: string };

  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" });
  }

  const newLeave = {
    id: `leave_${Date.now()}`,
    userId: userId || "u001",
    date,
    reason: reason || "Advance leave",
    status: "approved" as const,
    creditSaved: true,
    createdAt: new Date().toISOString(),
  };

  logger.info({ leave: newLeave }, "Student leave requested");
  return res.json({ success: true, leave: newLeave, message: "Leave applied successfully. 1 credit protected." });
});

// ── PATCH /api/student/profile ───────────────────────────────────────────────
router.patch("/profile", async (req, res) => {
  const { userId, name, email, phone } = req.body as {
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const updated = await userRepo.update(userId, { name, email, phone });
  logger.info({ userId, name, email, phone }, "Student profile updated");

  return res.json({
    success: true,
    message: "Profile updated successfully",
    user: updated,
  });
});

export default router;
