import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ── USERS TABLE ─────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  studentId: varchar("student_id", { length: 30 }), // e.g. GHH-ST-10482
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"), // student | owner | admin
  status: varchar("status", { length: 20 }).notNull().default("active"), // active | suspended | expired
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  loyaltyLevel: varchar("loyalty_level", { length: 20 }).notNull().default("bronze"), // bronze | silver | gold | platinum
  assignedLibraryId: text("assigned_library_id"),
  assignedSeat: text("assigned_seat"),
  assignedShift: text("assigned_shift"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── LIBRARIES TABLE (Unique Library ID Architecture: [PIN]-[CODE]) ──────────
export const librariesTable = pgTable("libraries", {
  id: text("id").primaryKey(), // internal UUID
  publicLibraryId: varchar("public_library_id", { length: 30 }), // e.g. 127306-GHH001 (Human Identity)
  libraryCode: varchar("library_code", { length: 20 }), // e.g. GHH001
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  ownerName: text("owner_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").default(""),
  pincode: varchar("pincode", { length: 6 }).default("127306"), // 6-digit Indian PIN
  area: text("area").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  googlePlaceId: text("google_place_id"),
  googleMapsUrl: text("google_maps_url"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.8"),
  totalSeats: integer("total_seats").notNull().default(60),
  availableSeats: integer("available_seats").notNull().default(60),
  occupancyRate: integer("occupancy_rate").default(0),
  billingMode: varchar("billing_mode", { length: 20 }).notNull().default("credit"), // credit | membership | custom
  facilities: jsonb("facilities").$type<string[]>().default(["AC", "WiFi", "RO Water", "CCTV", "Power Backup"]),
  wifiSSID: text("wifi_ssid").default("GHH_Library_WiFi"),
  upiQrVpa: text("upi_qr_vpa").default("ghh@upi"),
  isVerified: boolean("is_verified").notNull().default(true),
  isOpen: boolean("is_open").notNull().default(true),
  openTime: text("open_time").default("06:00 AM"),
  closeTime: text("close_time").default("11:00 PM"),
  monthlyRevenue: integer("monthly_revenue").default(0),
  image: text("image").default("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80"),
  noShowPolicyMinutes: integer("no_show_policy_minutes").default(30),
  maxNoShowsAllowed: integer("max_no_shows_allowed").default(3),
  exitReminderMinutes: integer("exit_reminder_minutes").default(60),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── LIBRARY BRANCHES TABLE ──────────────────────────────────────────────────
export const libraryBranchesTable = pgTable("library_branches", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  branchName: text("branch_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  totalSeats: integer("total_seats").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── SHIFTS TABLE ────────────────────────────────────────────────────────────
export const shiftsTable = pgTable("shifts", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  name: text("name").notNull(), // Morning | Afternoon | Evening | Full Day
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  capacity: integer("capacity").default(30),
  enrolledCount: integer("enrolled_count").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── SEATS TABLE (Multi-Floor 2D/3D Spatial Model) ──────────────────────────
export const seatsTable = pgTable("seats", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  floorId: text("floor_id"),
  floorCode: varchar("floor_code", { length: 10 }).default("G"), // B1 | G | M1 | F1 | F2 | F3
  zoneId: text("zone_id"),
  zoneName: text("zone_name").default("General Zone"),
  number: text("number").notNull(), // e.g. "F1-A12"
  rowLabel: text("row_label").notNull(),
  colNumber: integer("col_number").notNull(),
  category: varchar("category", { length: 20 }).notNull().default("standard"), // standard | window | premium | quiet | cabin
  status: varchar("status", { length: 20 }).notNull().default("available"), // available | reserved | occupied | maintenance | blocked
  shape: varchar("shape", { length: 30 }).default("single_desk"), // single_desk | double_desk | cubicle | cabin | round_table
  x: integer("x").default(0), // 2D layout coordinates
  y: integer("y").default(0),
  z: integer("z").default(0), // 3D vertical elevation
  rotation: integer("rotation").default(0),
  facilities: jsonb("facilities").$type<string[]>().default(["Charging", "AC", "WiFi"]),
  currentStudentId: text("current_student_id"),
  currentStudentName: text("current_student_name"),
  currentShiftId: text("current_shift_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── PLANS TABLE ─────────────────────────────────────────────────────────────
export const plansTable = pgTable("plans", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  name: text("name").notNull(),
  billingMode: varchar("billing_mode", { length: 20 }).notNull().default("credit"), // credit | membership | custom
  price: integer("price").notNull(),
  credits: integer("credits").default(0), // used when billingMode === 'credit'
  validityDays: integer("validity_days").notNull().default(30),
  accessType: varchar("access_type", { length: 20 }).default("shift"), // shift | unlimited | custom
  shiftIds: jsonb("shift_ids").$type<string[]>().default([]),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── MEMBERSHIPS TABLE ───────────────────────────────────────────────────────
export const membershipsTable = pgTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  libraryId: text("library_id").notNull(),
  planId: text("plan_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active | expired | suspended
  startDate: text("start_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  totalCredits: integer("total_credits").default(0),
  remainingCredits: integer("remaining_credits").default(0),
  consumedCredits: integer("consumed_credits").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── CREDIT TRANSACTIONS (LEDGER) ────────────────────────────────────────────
export const creditTransactionsTable = pgTable("credit_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  libraryId: text("library_id").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // PURCHASE | ATTENDANCE_DEDUCTION | LEAVE_PROTECTION | BONUS | REFUND | MANUAL_ADJUSTMENT | EXPIRY | CORRECTION
  amount: integer("amount").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"),
  actorId: text("actor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── PAYMENTS TABLE (FINANCIAL LEDGER) ───────────────────────────────────────
export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  studentName: text("student_name").notNull(),
  libraryId: text("library_id").notNull(),
  libraryName: text("library_name").notNull(),
  planId: text("plan_id"),
  planName: text("plan_name").notNull(),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 20 }).notNull().default("UPI"), // GATEWAY | UPI | CASH | BANK_TRANSFER | OTHER
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | paid | failed | rejected | refunded | cancelled
  transactionId: text("transaction_id").notNull(),
  referenceNo: text("reference_no"),
  receiptNumber: text("receipt_number").notNull().unique(),
  creditsAdded: integer("credits_added").default(0),
  validityDays: integer("validity_days").default(30),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── BOOKINGS TABLE ──────────────────────────────────────────────────────────
export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  studentName: text("student_name").notNull(),
  libraryId: text("library_id").notNull(),
  seatId: text("seat_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  shiftId: text("shift_id").notNull(),
  shiftName: text("shift_name").notNull(),
  bookingDate: text("booking_date").notNull(), // YYYY-MM-DD
  startTime: text("start_time").notNull(),
  expiryTime: text("expiry_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed | checked_in | cancelled | no_show | expired
  noShowFlag: boolean("no_show_flag").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── WAITLISTS TABLE ─────────────────────────────────────────────────────────
export const waitlistsTable = pgTable("waitlists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  studentName: text("student_name").notNull(),
  libraryId: text("library_id").notNull(),
  shiftId: text("shift_id").notNull(),
  shiftName: text("shift_name").notNull(),
  bookingDate: text("booking_date").notNull(),
  queuePosition: integer("queue_position").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting | notified | claimed | expired | cancelled
  notifiedAt: timestamp("notified_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── ATTENDANCE TABLE ────────────────────────────────────────────────────────
export const attendanceTable = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  studentName: text("student_name").notNull(),
  libraryId: text("library_id").notNull(),
  seatId: text("seat_id"),
  seatNumber: text("seat_number"),
  shiftId: text("shift_id"),
  shiftName: text("shift_name"),
  date: text("date").notNull(), // YYYY-MM-DD
  entryTime: text("entry_time").notNull(),
  exitTime: text("exit_time"),
  durationMinutes: integer("duration_minutes"),
  durationFormatted: text("duration_formatted"),
  creditDeducted: boolean("credit_deducted").notNull().default(true),
  isLeave: boolean("is_leave").notNull().default(false),
  entryMethod: varchar("entry_method", { length: 20 }).default("qr"), // qr | wifi | manual
  status: varchar("status", { length: 20 }).notNull().default("present"), // present | absent | leave
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── LEAVES TABLE ────────────────────────────────────────────────────────────
export const leavesTable = pgTable("leaves", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  libraryId: text("library_id").notNull(),
  leaveDate: text("leave_date").notNull(), // YYYY-MM-DD
  reason: text("reason").default("Advance leave"),
  status: varchar("status", { length: 20 }).notNull().default("approved"), // pending | approved | rejected | cancelled
  creditSaved: boolean("credit_saved").notNull().default(true),
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── REWARDS & ACHIEVEMENTS TABLE ────────────────────────────────────────────
export const rewardsTable = pgTable("rewards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badgeIcon: text("badge_icon").notNull(),
  category: varchar("category", { length: 30 }).default("streak"), // streak | hours | attendance | loyalty
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  isClaimed: boolean("is_claimed").notNull().default(false),
  rewardCredits: integer("reward_credits").notNull().default(2),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── NOTIFICATIONS TABLE ─────────────────────────────────────────────────────
export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  libraryId: text("library_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull().default("alert"), // booking | attendance | payment | reward | announcement | alert
  isRead: boolean("is_read").notNull().default(false),
  targetRole: varchar("target_role", { length: 20 }).default("all"), // student | owner | admin | all
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── ANNOUNCEMENTS TABLE ─────────────────────────────────────────────────────
export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetGroup: varchar("target_group", { length: 30 }).notNull().default("all"), // all | active | shift
  targetShiftId: text("target_shift_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── AUDIT LOGS TABLE ────────────────────────────────────────────────────────
export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").default("System"),
  actorRole: varchar("actor_role", { length: 20 }).notNull(),
  action: text("action").notNull(),
  targetEntity: text("target_entity").notNull(), // seat | student | plan | payment | attendance | shift
  targetId: text("target_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  reason: text("reason"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── REMOTE CONFIGURATION & FEATURE FLAGS TABLE ─────────────────────────────
export const remoteConfigTable = pgTable("remote_config", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("text"), // boolean | text | color | number | json | select
  category: varchar("category", { length: 30 }).notNull().default("texts"), // features | screens | buttons | actions | texts | theme | maintenance | app_version | popups | banners
  label: text("label").notNull(),
  description: text("description"),
  options: jsonb("options").$type<string[]>(),
  libraryId: text("library_id"), // null = global, or specific library override
  isDraft: boolean("is_draft").notNull().default(false),
  version: integer("version").notNull().default(1),
  updatedBy: text("updated_by").default("Master Admin"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── POPUPS TABLE (Targeted In-App Modals) ────────────────────────────────────
export const popupsTable = pgTable("popups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  icon: text("icon").default("bell-ring"),
  button1Text: text("button1_text").default("OK"),
  button1Action: text("button1_action").default("DISMISS"), // DISMISS | OPEN_SCREEN | OPEN_URL | OPEN_WALLET | OPEN_BOOKING
  button2Text: text("button2_text"),
  button2Action: text("button2_action"),
  targetScreen: varchar("target_screen", { length: 50 }).notNull().default("home"), // any | home | wallet | qr | rewards
  targetRole: varchar("target_role", { length: 20 }).notNull().default("all"), // all | student | owner
  targetLibraryId: text("target_library_id"),
  userSegment: varchar("user_segment", { length: 30 }).default("all"), // all | new | active | low_credits | expiring
  frequency: varchar("frequency", { length: 30 }).notNull().default("once_per_day"), // once | once_per_day | every_login | until_dismissed
  startDate: text("start_date"),
  endDate: text("end_date"),
  priority: integer("priority").notNull().default(1),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── BANNERS TABLE (Promotional Cards) ───────────────────────────────────────
export const bannersTable = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  buttonText: text("button_text").default("Explore"),
  action: text("action").default("OPEN_SCREEN:wallet"),
  targetRole: varchar("target_role", { length: 20 }).notNull().default("all"),
  libraryId: text("library_id"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  priority: integer("priority").notNull().default(1),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── CONFIG VERSIONS TABLE (Snapshot & Rollback History) ──────────────────────
export const configVersionsTable = pgTable("config_versions", {
  id: text("id").primaryKey(),
  versionNumber: integer("version_number").notNull().unique(),
  snapshot: jsonb("snapshot").notNull(),
  changeSummary: text("change_summary").notNull(),
  actorId: text("actor_id").notNull().default("admin_001"),
  actorName: text("actor_name").notNull().default("Master Admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── ADMIN SESSIONS TABLE (Master Security) ──────────────────────────────────
export const adminSessionsTable = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── DAILY CLOSING REPORTS TABLE (Business Intelligence) ─────────────────────
export const dailyClosingReportsTable = pgTable("daily_closing_reports", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  reportDate: text("report_date").notNull(), // YYYY-MM-DD
  totalCheckIns: integer("total_check_ins").notNull().default(0),
  totalCheckOuts: integer("total_check_outs").notNull().default(0),
  newStudents: integer("new_students").notNull().default(0),
  renewals: integer("renewals").notNull().default(0),
  totalRevenue: integer("total_revenue").notNull().default(0),
  peakOccupancyPct: integer("peak_occupancy_pct").notNull().default(0),
  availableSeatsAtPeak: integer("available_seats_at_peak").notNull().default(0),
  expiringMemberships: integer("expiring_memberships").notNull().default(0),
  pendingPayments: integer("pending_payments").notNull().default(0),
  noShows: integer("no_shows").notNull().default(0),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

// ── INVOICES TABLE (Professional Receipts) ──────────────────────────────────
export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(), // e.g. GHH-INV-2026-0001
  paymentId: text("payment_id").notNull(),
  libraryId: text("library_id").notNull(),
  libraryName: text("library_name").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userPhone: text("user_phone"),
  planName: text("plan_name").notNull(),
  billingModel: varchar("billing_model", { length: 30 }).default("credit"),
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  couponCode: text("coupon_code"),
  taxAmount: integer("tax_amount").notNull().default(0),
  finalAmount: integer("final_amount").notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull().default("UPI"),
  transactionId: text("transaction_id"),
  creditsAdded: integer("credits_added").notNull().default(0),
  validityDays: integer("validity_days").notNull().default(30),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("paid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── SUSPICIOUS ACTIVITIES TABLE (Fraud & Security Engine) ───────────────────
export const suspiciousActivitiesTable = pgTable("suspicious_activities", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  userName: text("user_name").default("Unknown User"),
  libraryId: text("library_id"),
  signalType: varchar("signal_type", { length: 50 }).notNull(), // repeated_failed_qr | abnormal_punch | multiple_devices | failed_payments | rapid_attendance
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // low | medium | high | critical
  status: varchar("status", { length: 30 }).notNull().default("detected"), // detected | under_review | dismissed | restricted | suspended | resolved
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── USER DEVICES TABLE (Device Management & Anti-Sharing) ───────────────────
export const userDevicesTable = pgTable("user_devices", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  deviceName: text("device_name").notNull(), // e.g. Samsung Galaxy A35
  deviceType: varchar("device_type", { length: 20 }).notNull().default("android"), // android | ios | web
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: text("ip_address"),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  isTrusted: boolean("is_trusted").notNull().default(true),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── COUPONS TABLE (Dynamic Offers & Promo Codes) ────────────────────────────
export const couponsTable = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(), // uppercase e.g. WELCOME50
  discountType: varchar("discount_type", { length: 20 }).notNull().default("fixed"), // fixed | percentage
  discountValue: integer("discount_value").notNull(), // amount in INR or percentage
  minPurchaseAmount: integer("min_purchase_amount").notNull().default(0),
  maxDiscountAmount: integer("max_discount_amount"), // for percentage caps
  startDate: text("start_date"),
  endDate: text("end_date"),
  usageLimitTotal: integer("usage_limit_total").default(100),
  usageLimitPerUser: integer("usage_limit_per_user").default(1),
  usedCount: integer("used_count").notNull().default(0),
  libraryId: text("library_id"), // null = global
  applicablePlans: jsonb("applicable_plans").$type<string[]>(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── COUPON USAGES TABLE ─────────────────────────────────────────────────────
export const couponUsagesTable = pgTable("coupon_usages", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id").notNull(),
  userId: text("user_id").notNull(),
  paymentId: text("payment_id"),
  discountApplied: integer("discount_applied").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── WHATSAPP TEMPLATES TABLE (Automated Messaging) ──────────────────────────
export const whatsappTemplatesTable = pgTable("whatsapp_templates", {
  id: text("id").primaryKey(),
  eventTrigger: varchar("event_trigger", { length: 50 }).notNull().unique(), // payment_success | membership_activated | expiry_reminder | low_credits | booking_confirmed | leave_approved | daily_report | emergency_alert
  targetRole: varchar("target_role", { length: 20 }).notNull().default("student"), // student | owner
  templateName: text("template_name").notNull(),
  templateBody: text("template_body").notNull(),
  variables: jsonb("variables").$type<string[]>(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── FLOORS & ZONES TABLES (Multi-Floor Digital Twin Engine) ──────────────────
export const floorsTable = pgTable("floors", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull(),
  floorCode: varchar("floor_code", { length: 10 }).notNull().default("G"), // B1 | G | M1 | F1 | F2 | F3 | R
  floorOrder: integer("floor_order").notNull().default(0), // -1 for Basement, 0 for Ground, 1 for F1...
  floorName: text("floor_name").notNull(), // Basement, Ground Floor, 1st Floor, Mezzanine, Rooftop
  floorType: varchar("floor_type", { length: 30 }).notNull().default("standard"), // basement | ground | mezzanine | standard | terrace | rooftop
  totalCapacity: integer("total_capacity").notNull().default(50),
  isClosed: boolean("is_closed").notNull().default(false),
  closureReason: text("closure_reason"),
  operatingHours: text("operating_hours").default("06:00 AM - 11:00 PM"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const zonesTable = pgTable("zones", {
  id: text("id").primaryKey(),
  floorId: text("floor_id").notNull(),
  libraryId: text("library_id").notNull(),
  zoneName: text("zone_name").notNull(), // Quiet Zone, Discussion Room, AC Premium, Window View
  zoneType: varchar("zone_type", { length: 30 }).notNull().default("quiet"), // quiet | discussion | premium | window | general
  capacity: integer("capacity").notNull().default(20),
  colorCode: text("color_code").default("#4F8EF7"),
  noisePolicy: varchar("noise_policy", { length: 30 }).default("silent"), // silent | moderate | discussion
  facilities: jsonb("facilities").$type<string[]>().default(["AC", "WiFi", "Charging"]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── STUDY GOALS & FOCUS SESSIONS TABLES (Student Experience) ─────────────────
export const studyGoalsTable = pgTable("study_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull().default("monthly"), // daily | weekly | monthly
  targetHours: integer("target_hours").notNull(),
  currentHours: integer("current_hours").notNull().default(0),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const focusSessionsTable = pgTable("focus_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  tag: text("tag").default("General Study"), // UPSC, NEET, Coding, Reading
  notes: text("notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── RULES & AUTOMATION ENGINE TABLES (Parts 56, 57) ─────────────────────────
export const rulesTable = pgTable("rules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerEvent: varchar("trigger_event", { length: 50 }).notNull(), // LOW_CREDITS | NO_SHOW | MEMBERSHIP_EXPIRY | PAYMENT_SUCCESS | ATTENDANCE_PUNCH
  conditions: jsonb("conditions").notNull(), // { credit_threshold: 5, status: "active" }
  actions: jsonb("actions").notNull(), // { action: "SEND_NOTIFICATION", template: "low_credits" }
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdBy: text("created_by").default("Master Admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ruleExecutionsTable = pgTable("rule_executions", {
  id: text("id").primaryKey(),
  ruleId: text("rule_id").notNull(),
  targetUserId: text("target_user_id"),
  targetEntityId: text("target_entity_id"),
  executionResult: text("execution_result").notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

// ── SUPPORT TICKETS TABLE (Part 61) ──────────────────────────────────────────
export const supportTicketsTable = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  libraryId: text("library_id").notNull(),
  category: varchar("category", { length: 30 }).notNull().default("general"), // seat | wifi | ac | noise | payment | app_bug | general
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low | medium | high | urgent
  status: varchar("status", { length: 20 }).notNull().default("open"), // open | in_progress | resolved | closed
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── SYSTEM HEALTH & INCIDENTS (Part 95, 96) ──────────────────────────────────
export const systemHealthTable = pgTable("system_health", {
  id: text("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(), // api | postgresql | websocket | redis | payments | storage
  status: varchar("status", { length: 20 }).notNull().default("healthy"), // healthy | degraded | down
  latencyMs: integer("latency_ms").notNull().default(12),
  errorCount: integer("error_count").notNull().default(0),
  lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(),
});

// ── RELATIONS ───────────────────────────────────────────────────────────────
export const usersRelations = relations(usersTable, ({ many }) => ({
  memberships: many(membershipsTable),
  creditTransactions: many(creditTransactionsTable),
  payments: many(paymentsTable),
  bookings: many(bookingsTable),
  attendance: many(attendanceTable),
  leaves: many(leavesTable),
  rewards: many(rewardsTable),
  devices: many(userDevicesTable),
  invoices: many(invoicesTable),
  goals: many(studyGoalsTable),
  focusSessions: many(focusSessionsTable),
  tickets: many(supportTicketsTable),
}));

export const librariesRelations = relations(librariesTable, ({ many }) => ({
  branches: many(libraryBranchesTable),
  shifts: many(shiftsTable),
  seats: many(seatsTable),
  plans: many(plansTable),
  memberships: many(membershipsTable),
  payments: many(paymentsTable),
  bookings: many(bookingsTable),
  attendance: many(attendanceTable),
  announcements: many(announcementsTable),
  dailyReports: many(dailyClosingReportsTable),
  floors: many(floorsTable),
  zones: many(zonesTable),
  tickets: many(supportTicketsTable),
}));

// ── ZOD SCHEMAS & TYPES ─────────────────────────────────────────────────────
export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type UserRecord = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export const insertLibrarySchema = createInsertSchema(librariesTable);
export const selectLibrarySchema = createSelectSchema(librariesTable);
export type LibraryRecord = typeof librariesTable.$inferSelect;
export type InsertLibrary = typeof librariesTable.$inferInsert;

export const insertSeatSchema = createInsertSchema(seatsTable);
export type SeatRecord = typeof seatsTable.$inferSelect;

export const insertPlanSchema = createInsertSchema(plansTable);
export type PlanRecord = typeof plansTable.$inferSelect;

export const insertPaymentSchema = createInsertSchema(paymentsTable);
export type PaymentRecord = typeof paymentsTable.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookingsTable);
export type BookingRecord = typeof bookingsTable.$inferSelect;

export const insertAttendanceSchema = createInsertSchema(attendanceTable);
export type AttendanceRecord = typeof attendanceTable.$inferSelect;

export const insertCreditTransactionSchema = createInsertSchema(creditTransactionsTable);
export type CreditTransactionRecord = typeof creditTransactionsTable.$inferSelect;

export const insertAuditLogSchema = createInsertSchema(auditLogsTable);
export type AuditLogRecord = typeof auditLogsTable.$inferSelect;

export const insertRemoteConfigSchema = createInsertSchema(remoteConfigTable);
export type RemoteConfigRecord = typeof remoteConfigTable.$inferSelect;

export const insertPopupSchema = createInsertSchema(popupsTable);
export type PopupRecord = typeof popupsTable.$inferSelect;

export const insertBannerSchema = createInsertSchema(bannersTable);
export type BannerRecord = typeof bannersTable.$inferSelect;

export const insertConfigVersionSchema = createInsertSchema(configVersionsTable);
export type ConfigVersionRecord = typeof configVersionsTable.$inferSelect;

export const insertAdminSessionSchema = createInsertSchema(adminSessionsTable);
export type AdminSessionRecord = typeof adminSessionsTable.$inferSelect;

export const insertDailyClosingReportSchema = createInsertSchema(dailyClosingReportsTable);
export type DailyClosingReportRecord = typeof dailyClosingReportsTable.$inferSelect;

export const insertInvoiceSchema = createInsertSchema(invoicesTable);
export type InvoiceRecord = typeof invoicesTable.$inferSelect;

export const insertSuspiciousActivitySchema = createInsertSchema(suspiciousActivitiesTable);
export type SuspiciousActivityRecord = typeof suspiciousActivitiesTable.$inferSelect;

export const insertUserDeviceSchema = createInsertSchema(userDevicesTable);
export type UserDeviceRecord = typeof userDevicesTable.$inferSelect;

export const insertCouponSchema = createInsertSchema(couponsTable);
export type CouponRecord = typeof couponsTable.$inferSelect;

export const insertCouponUsageSchema = createInsertSchema(couponUsagesTable);
export type CouponUsageRecord = typeof couponUsagesTable.$inferSelect;

export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplatesTable);
export type WhatsappTemplateRecord = typeof whatsappTemplatesTable.$inferSelect;

export const insertFloorSchema = createInsertSchema(floorsTable);
export type FloorRecord = typeof floorsTable.$inferSelect;

export const insertZoneSchema = createInsertSchema(zonesTable);
export type ZoneRecord = typeof zonesTable.$inferSelect;

export const insertStudyGoalSchema = createInsertSchema(studyGoalsTable);
export type StudyGoalRecord = typeof studyGoalsTable.$inferSelect;

export const insertFocusSessionSchema = createInsertSchema(focusSessionsTable);
export type FocusSessionRecord = typeof focusSessionsTable.$inferSelect;

export const insertRuleSchema = createInsertSchema(rulesTable);
export type RuleRecord = typeof rulesTable.$inferSelect;

export const insertSupportTicketSchema = createInsertSchema(supportTicketsTable);
export type SupportTicketRecord = typeof supportTicketsTable.$inferSelect;

export const insertSystemHealthSchema = createInsertSchema(systemHealthTable);
export type SystemHealthRecord = typeof systemHealthTable.$inferSelect;

// ── BUG REPORTS TABLE (User Bug Reporting System) ───────────────────────────
export const bugReportsTable = pgTable("bug_reports", {
  id: text("id").primaryKey(),
  reportId: varchar("report_id", { length: 40 }).notNull().unique(), // e.g. BUG-20260828-00482
  userId: text("user_id").notNull(),
  userName: text("user_name").default("Anonymous"),
  libraryId: text("library_id"),
  category: varchar("category", { length: 50 }).notNull(), // App Crash | QR Attendance | Seat Booking | Payment | Credits | UI Problem | Other
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // normal | important | urgent
  status: varchar("status", { length: 30 }).notNull().default("reported"), // reported | received | investigating | fix_in_progress | resolved | closed | need_info
  appVersion: varchar("app_version", { length: 30 }).default("1.0.4"),
  buildNumber: varchar("build_number", { length: 30 }).default("104"),
  deviceModel: text("device_model").default("Android Device"),
  osVersion: text("os_version").default("Android 14"),
  screenName: text("screen_name").default("General"),
  networkState: varchar("network_state", { length: 20 }).default("online"),
  correlationId: text("correlation_id"),
  screenshotUrl: text("screenshot_url"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── CRASH REPORTS & FINGERPRINTS (Automatic Crash Detection) ────────────────
export const crashReportsTable = pgTable("crash_reports", {
  id: text("id").primaryKey(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull().unique(), // Hash of stack signature
  crashType: varchar("crash_type", { length: 100 }).notNull(), // NullReferenceException, NetworkTimeout, UnhandledPromise
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  screenName: text("screen_name").default("Unknown"),
  appVersion: varchar("app_version", { length: 30 }).default("1.0.4"),
  buildNumber: varchar("build_number", { length: 30 }).default("104"),
  deviceModel: text("device_model").default("Generic Android"),
  osVersion: text("os_version").default("Android 14"),
  severity: varchar("severity", { length: 20 }).notNull().default("high"), // low | medium | high | critical
  status: varchar("status", { length: 30 }).notNull().default("unresolved"), // unresolved | investigating | resolved
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  lastOccurredAt: timestamp("last_occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── INCIDENTS TABLE (Automated Incident Detection & Postmortems) ────────────
export const incidentsTable = pgTable("incidents", {
  id: text("id").primaryKey(),
  incidentNumber: varchar("incident_number", { length: 30 }).notNull().unique(), // e.g. INC-2048
  title: text("title").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // api_errors | payment_failure | database_latency | crash_spike
  severity: varchar("severity", { length: 20 }).notNull().default("high"), // low | medium | high | critical
  status: varchar("status", { length: 30 }).notNull().default("detected"), // detected | investigating | mitigating | resolved | closed
  affectedService: varchar("affected_service", { length: 50 }).notNull(),
  affectedVersion: varchar("affected_version", { length: 30 }).default("1.0.4"),
  errorRate: text("error_rate"),
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── TELEMETRY & ENDPOINT METRICS (API Observability) ────────────────────────
export const telemetryMetricsTable = pgTable("telemetry_metrics", {
  id: text("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: varchar("method", { length: 10 }).notNull().default("GET"),
  statusCode: integer("status_code").notNull().default(200),
  latencyMs: integer("latency_ms").notNull().default(10),
  correlationId: text("correlation_id"),
  appVersion: varchar("app_version", { length: 30 }).default("1.0.4"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBugReportSchema = createInsertSchema(bugReportsTable);
export type BugReportRecord = typeof bugReportsTable.$inferSelect;

export const insertCrashReportSchema = createInsertSchema(crashReportsTable);
export type CrashReportRecord = typeof crashReportsTable.$inferSelect;

export const insertIncidentSchema = createInsertSchema(incidentsTable);
export type IncidentRecord = typeof incidentsTable.$inferSelect;

export const insertTelemetryMetricSchema = createInsertSchema(telemetryMetricsTable);
export type TelemetryMetricRecord = typeof telemetryMetricsTable.$inferSelect;