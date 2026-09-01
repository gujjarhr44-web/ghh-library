import { Router } from "express";
import { logger } from "../lib/logger";
import { userRepo, leaveRepo, walletRepo } from "../lib/db-repo";

const router = Router();

// ── GET /api/student/wallet ──────────────────────────────────────────────────
router.get("/wallet", async (req, res) => {
  const userId = (req.query["userId"] as string) || "";
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const wallet = await walletRepo.getStudentWallet(userId);
    return res.json({ success: true, ...wallet });
  } catch (err: any) {
    logger.error({ err }, "Error getting student wallet");
    return res.status(500).json({ success: false, message: err.message || "Failed to retrieve wallet" });
  }
});

// ── GET /api/student/leaves ──────────────────────────────────────────────────
router.get("/leaves", async (req, res) => {
  const userId = (req.query["userId"] as string) || "";
  if (!userId) {
    return res.json({ success: true, leaves: [] });
  }

  try {
    const leaves = await leaveRepo.listByUser(userId);
    return res.json({ success: true, leaves });
  } catch (err: any) {
    logger.error({ err }, "Error querying leaves");
    return res.status(500).json({ success: false, message: "Failed to query leaves" });
  }
});

// ── POST /api/student/leave ──────────────────────────────────────────────────
router.post("/leave", async (req, res) => {
  const { userId, libraryId, date, reason } = req.body as {
    userId?: string;
    libraryId?: string;
    date?: string;
    reason?: string;
  };

  if (!userId || !date) {
    return res.status(400).json({ success: false, message: "User ID and date are required" });
  }

  try {
    const leave = await leaveRepo.applyLeave({
      userId,
      libraryId: libraryId || "lib001",
      leaveDate: date,
      reason: reason || "Advance leave",
    });

    logger.info({ leaveId: leave.id, userId, date }, "Student leave recorded and credit protected");
    return res.json({
      success: true,
      leave,
      message: `Leave recorded for ${date}. 1 credit protected from deduction.`,
    });
  } catch (err: any) {
    logger.error({ err }, "Error applying leave");
    return res.status(500).json({ success: false, message: err.message || "Failed to apply leave" });
  }
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

  try {
    const updated = await userRepo.update(userId, { name, email, phone });
    logger.info({ userId, name, email, phone }, "Student profile updated");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err: any) {
    logger.error({ err }, "Error updating student profile");
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

export default router;
