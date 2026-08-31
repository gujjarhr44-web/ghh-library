import { Router } from "express";
import { logger } from "../lib/logger";
import { paymentRepo, couponRepo, invoiceRepo } from "../lib/db-repo";

const router = Router();

// ── 1. POST /api/payments/validate-coupon (Validate Promo Code) ───────────────
router.post("/validate-coupon", async (req, res) => {
  const { code, userId, amount, planId } = req.body;
  if (!code || !amount) {
    return res.status(400).json({ valid: false, message: "Coupon code and amount are required" });
  }

  try {
    const result = await couponRepo.validate(code, userId || "u_guest", Number(amount), planId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ valid: false, message: err.message || "Invalid coupon" });
  }
});

// ── 2. POST /api/payments/manual (Owner Records Walk-in/Direct Payment) ───────
router.post("/manual", async (req, res) => {
  const {
    userId,
    studentName,
    libraryId,
    libraryName,
    planId,
    planName,
    amount,
    method,
    transactionId,
    creditsAdded,
    validityDays,
    notes,
    approvedBy,
    couponCode,
    discountAmount,
  } = req.body;

  if (!studentName || !amount || !planName) {
    return res.status(400).json({ success: false, message: "Student name, plan name, and amount are required" });
  }

  try {
    const payment = await paymentRepo.recordPayment({
      userId: userId || `u_${Date.now()}`,
      studentName,
      libraryId: libraryId || "lib001",
      libraryName: libraryName || "GHH Central Library",
      planId,
      planName,
      amount: Number(amount),
      method: method || "CASH",
      status: "paid",
      transactionId: transactionId || `MANUAL-${Date.now()}`,
      creditsAdded: Number(creditsAdded) || 30,
      validityDays: Number(validityDays) || 30,
      approvedBy: approvedBy || "Library Owner",
      notes,
    });

    // Auto-generate official digital invoice (Rule #3)
    const invoice = await invoiceRepo.generate(
      payment,
      { id: userId, name: studentName },
      { id: libraryId, name: libraryName },
      couponCode,
      Number(discountAmount) || 0
    );

    logger.info({ paymentId: payment.id, receiptNumber: payment.receiptNumber, invoiceNumber: invoice.invoiceNumber }, "Manual payment and invoice recorded");

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully. Invoice #${invoice.invoiceNumber} generated.`,
      payment,
      invoice,
    });
  } catch (err: any) {
    logger.error({ err }, "Error recording payment");
    return res.status(500).json({ success: false, message: err.message || "Failed to record payment" });
  }
});

// ── 3. POST /api/payments/request-verification (Student Submits UPI Reference)
router.post("/request-verification", async (req, res) => {
  const {
    userId,
    studentName,
    libraryId,
    libraryName,
    planId,
    planName,
    amount,
    transactionId,
    credits,
    validity,
  } = req.body;

  if (!transactionId || !amount) {
    return res.status(400).json({ success: false, message: "Transaction ID and amount are required" });
  }

  try {
    const payment = await paymentRepo.recordPayment({
      userId: userId || "u001",
      studentName: studentName || "Student",
      libraryId: libraryId || "lib001",
      libraryName: libraryName || "GHH Central Library",
      planId,
      planName: planName || `${credits} Credits Pack`,
      amount: Number(amount),
      method: "UPI",
      status: "pending",
      transactionId,
      creditsAdded: Number(credits) || 30,
      validityDays: Number(validity) || 30,
      notes: "Student submitted UPI reference for verification",
    });

    return res.status(201).json({
      success: true,
      message: "Payment verification submitted. Credits will be activated upon owner approval.",
      payment,
    });
  } catch (err: any) {
    logger.error({ err }, "Error submitting payment verification");
    return res.status(500).json({ success: false, message: err.message || "Failed to submit payment" });
  }
});

// ── 4. GET /api/payments/receipts (User Receipts) ─────────────────────────────
router.get("/receipts", async (req, res) => {
  const userId = (req.query["userId"] as string) || "";
  const payments = await paymentRepo.listByUser(userId);
  res.json(payments);
});

// ── 5. GET /api/payments/pending (Owner Approvals) ────────────────────────────
router.get("/pending", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "";
  const all = await paymentRepo.listByLibrary(libraryId);
  const pending = all.filter((p) => p.status === "pending");
  res.json(pending);
});

// ── 6. POST /api/payments/approve (Owner Approves Pending Payment) ───────────
router.post("/approve", async (req, res) => {
  const { paymentId, approvedBy } = req.body;
  if (!paymentId) {
    return res.status(400).json({ success: false, message: "Payment ID is required" });
  }

  try {
    const payment = await paymentRepo.approvePayment(paymentId, approvedBy || "Library Owner");
    logger.info({ paymentId, status: payment.status }, "Payment approved and credits activated");
    return res.json({
      success: true,
      message: `Payment #${payment.receiptNumber || paymentId} approved. Credits activated for student.`,
      payment,
    });
  } catch (err: any) {
    logger.error({ err }, "Error approving payment");
    return res.status(500).json({ success: false, message: err.message || "Failed to approve payment" });
  }
});

// ── 7. POST /api/payments/reject (Owner Rejects Invalid Payment) ─────────────
router.post("/reject", async (req, res) => {
  const { paymentId, reason } = req.body;
  if (!paymentId) {
    return res.status(400).json({ success: false, message: "Payment ID is required" });
  }

  try {
    const payment = await paymentRepo.rejectPayment(paymentId, reason);
    logger.info({ paymentId }, "Payment rejected");
    return res.json({
      success: true,
      message: "Payment rejected.",
      payment,
    });
  } catch (err: any) {
    logger.error({ err }, "Error rejecting payment");
    return res.status(500).json({ success: false, message: err.message || "Failed to reject payment" });
  }
});

export default router;
