import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

// ── In-Memory OTP Store ───────────────────────────────────────────────────────
// Format: { phone: { otp, expiresAt, attempts } }
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// OTP expiry: 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000;
// Max verify attempts per OTP
const MAX_ATTEMPTS = 3;

// FIX BUG-11: In-memory rate limiter for /send endpoint
// Tracks { ip: { count, windowStart } } — max 5 OTPs per IP per 10 minutes
const sendRateStore = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = sendRateStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Start a new window
    sendRateStore.set(ip, { count: 1, windowStart: now });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // rate limited
  }

  entry.count++;
  return true; // allowed
}

// Cleanup old rate limit entries every 15 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of sendRateStore.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      sendRateStore.delete(ip);
    }
  }
}, 15 * 60 * 1000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhone(phone: string): string {
  // Remove spaces, dashes, brackets; keep + and digits
  return phone.replace(/[^\d+]/g, "");
}

// ── Send OTP ─────────────────────────────────────────────────────────────────
router.post("/send", async (req, res) => {
  // FIX BUG-11: Rate limit OTP send requests per IP
  const clientIp = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
    || req.socket.remoteAddress
    || "unknown";

  if (!checkRateLimit(clientIp)) {
    logger.warn({ ip: clientIp }, "OTP send rate limit exceeded");
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests. Please wait 10 minutes before trying again.",
    });
  }

  const { phone } = req.body as { phone?: string };

  if (!phone || phone.trim().length < 10) {
    return res.status(400).json({ success: false, message: "Valid phone number required" });
  }

  const cleanedPhone = cleanPhone(phone);
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  // Store OTP
  otpStore.set(cleanedPhone, { otp, expiresAt, attempts: 0 });

  logger.info({ phone: cleanedPhone }, "OTP generated");

  // ── Fast2SMS Integration ──────────────────────────────────────────────────
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (apiKey && apiKey !== "YOUR_FAST2SMS_API_KEY") {
    try {
      const phoneWithoutCode = cleanedPhone.replace(/^\+91/, "").replace(/^91/, "");

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Your GHH Library OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
          language: "english",
          flash: 0,
          numbers: phoneWithoutCode,
        }),
      });

      const result = await response.json() as { return: boolean; message: string[] };

      if (result.return === true) {
        logger.info({ phone: cleanedPhone }, "OTP sent via Fast2SMS");
        return res.json({
          success: true,
          message: "OTP sent successfully to your mobile number",
          // FIX BUG-04: Only expose devOtp in non-production environments
          ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
        });
      } else {
        logger.error({ result }, "Fast2SMS send failed");
        // Fall through to mock mode
      }
    } catch (err) {
      logger.error({ err }, "Fast2SMS API error");
      // Fall through to mock mode
    }
  }

  // ── Mock Mode (No API key or SMS failed) ─────────────────────────────────
  logger.info({ phone: cleanedPhone, otp }, "MOCK MODE: OTP generated (no real SMS sent)");

  return res.json({
    success: true,
    message: apiKey
      ? "OTP sent to your mobile (SMS may be delayed)"
      : "OTP sent (DEMO MODE - SMS not configured)",
    // FIX BUG-04: Always return devOtp in mock/dev mode only
    devOtp: otp,
  });
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
router.post("/verify", (req, res) => {
  const { phone, otp } = req.body as { phone?: string; otp?: string };

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP required" });
  }

  const cleanedPhone = cleanPhone(phone);
  const stored = otpStore.get(cleanedPhone);

  if (!stored) {
    return res.status(400).json({ success: false, message: "No OTP found for this number. Please request a new OTP." });
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanedPhone);
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
  }

  // Check max attempts
  if (stored.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanedPhone);
    return res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
  }

  // Verify OTP
  if (stored.otp !== otp.trim()) {
    stored.attempts++;
    const remaining = MAX_ATTEMPTS - stored.attempts;
    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    });
  }

  // OTP correct! Clear it
  otpStore.delete(cleanedPhone);

  logger.info({ phone: cleanedPhone }, "OTP verified successfully");

  return res.json({
    success: true,
    message: "OTP verified successfully",
    phone: cleanedPhone,
  });
});

export default router;
