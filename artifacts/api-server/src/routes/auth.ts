import { Router } from "express";
import { userRepo, libraryRepo } from "../lib/db-repo";
import { signJwtToken, hashPassword, verifyPassword } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// Generate unique human-readable Student ID (e.g. GHH-ST-10482)
function generateStudentId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `GHH-ST-${num}`;
}

// ── 1. POST /api/auth/register (Real Student/Owner Registration) ─────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role = "student", referralCode, libraryId } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and password are all required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();

    // Check existing email
    const existingByEmail = await userRepo.findByEmail(cleanEmail);
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Check existing phone
    const existingByPhone = await userRepo.findByPhone(cleanPhone);
    if (existingByPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this mobile number already exists.",
      });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const studentId = role === "student" ? generateStudentId() : undefined;
    const passwordHash = hashPassword(password);
    const generatedReferral = `${name.toUpperCase().replace(/\s+/g, "").slice(0, 5)}${Math.floor(100 + Math.random() * 900)}`;

    const user = await userRepo.create({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: role as "student" | "owner" | "admin",
      referralCode: generatedReferral,
      assignedLibraryId: libraryId || undefined,
    });

    const token = signJwtToken({
      userId: user.id,
      role: user.role as any,
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentId: (user as any).studentId || studentId,
      libraryId: user.assignedLibraryId || undefined,
    });

    logger.info({ userId: user.id, role: user.role, email: cleanEmail }, "User registered successfully");

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        studentId: (user as any).studentId || studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        libraryId: user.assignedLibraryId,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error during registration");
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// ── 2. POST /api/auth/login (Email/Password Login) ───────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify Password Hash
    let isPasswordValid = false;
    if (user.passwordHash) {
      isPasswordValid = verifyPassword(password, user.passwordHash);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Role check if provided
    if (role && user.role !== role && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: `Account is registered as ${user.role}, not ${role}.`,
      });
    }

    const token = signJwtToken({
      userId: user.id,
      role: user.role as any,
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentId: (user as any).studentId,
      libraryId: user.assignedLibraryId || undefined,
    });

    logger.info({ userId: user.id, role: user.role }, "User logged in via email/password");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        studentId: (user as any).studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        libraryId: user.assignedLibraryId,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error during login");
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ── 3. POST /api/auth/otp-login (Mobile OTP Login / Auto-Registration) ───────
router.post("/otp-login", async (req, res) => {
  try {
    const { phone, role = "student", name } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();
    let user = await userRepo.findByPhone(cleanPhone);

    // If user does not exist yet, auto-register them
    if (!user) {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const studentId = role === "student" ? generateStudentId() : undefined;
      const userName = name?.trim() || `Student ${cleanPhone.slice(-4)}`;
      const generatedReferral = `GHH${cleanPhone.slice(-4)}`;

      user = await userRepo.create({
        id: userId,
        name: userName,
        email: `${cleanPhone.replace("+", "")}@ghh.member`,
        phone: cleanPhone,
        passwordHash: hashPassword(cleanPhone),
        role: role as "student" | "owner" | "admin",
        referralCode: generatedReferral,
      });
      logger.info({ userId: user.id, phone: cleanPhone }, "New student auto-created on first OTP verification");
    }

    const token = signJwtToken({
      userId: user.id,
      role: user.role as any,
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentId: (user as any).studentId,
      libraryId: user.assignedLibraryId || undefined,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        studentId: (user as any).studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        libraryId: user.assignedLibraryId,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error during OTP login session creation");
    return res.status(500).json({ success: false, message: "Server error during OTP session creation." });
  }
});

// ── 4. GET /api/auth/me (Get Authenticated Profile) ──────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        studentId: (user as any).studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        libraryId: user.assignedLibraryId,
        assignedSeat: (user as any).assignedSeat,
        assignedShift: (user as any).assignedShift,
        loyaltyLevel: (user as any).loyaltyLevel || "bronze",
        status: (user as any).status || "active",
      },
    });
  } catch (err) {
    logger.error({ err }, "Error fetching profile in /me");
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── 5. POST /api/auth/admin-login (Super Admin Secure Login) ─────────────────
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    const adminUser = process.env.ADMIN_USERNAME || "admin";

    if (username === adminUser && password === adminPass) {
      const token = signJwtToken(
        {
          userId: "super_admin_001",
          role: "super_admin",
          name: "Master Administrator",
          email: "admin@ghh.com",
          phone: "+919999999999",
        },
        24 * 60 * 60 // 24 hours for admin
      );

      logger.info("Master Administrator logged in");
      return res.json({
        success: true,
        token,
        role: "super_admin",
        name: "Master Administrator",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials.",
    });
  } catch (err) {
    logger.error({ err }, "Error during admin login");
    return res.status(500).json({ success: false, message: "Server error during admin login." });
  }
});

export default router;
