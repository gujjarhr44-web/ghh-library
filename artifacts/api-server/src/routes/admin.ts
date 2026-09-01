import { Router } from "express";
import {
  statsRepo,
  libraryRepo,
  userRepo,
  paymentRepo,
  attendanceRepo,
  remoteConfigRepo,
  popupRepo,
  bannerRepo,
  auditLogRepo,
  fraudRepo,
  couponRepo,
  whatsappRepo,
  rulesEngineRepo,
  supportTicketRepo,
  systemHealthRepo,
  digitalTwinRepo,
  bugRepo,
  crashRepo,
  incidentRepo,
} from "../lib/db-repo";
import { logger } from "../lib/logger";

const router = Router();

// ── 1. Platform-Wide Admin Stats (Rule #67, #68, #80) ─────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const stats = await statsRepo.getAdminStats();
    res.json(stats);
  } catch (err) {
    logger.error({ err }, "Error getting admin stats");
    res.status(500).json({ error: "Failed to retrieve stats" });
  }
});

// ── 2. Chart Trends ──────────────────────────────────────────────────────────
router.get("/charts/student-growth", async (_req, res) => {
  const users = await userRepo.listAll();
  const studentCount = users.filter((u) => u.role === "student").length;
  res.json([
    { month: "Jan", value: 0, secondary: 0 },
    { month: "Feb", value: 0, secondary: 0 },
    { month: "Mar", value: 0, secondary: 0 },
    { month: "Apr", value: 0, secondary: 0 },
    { month: "May", value: 0, secondary: 0 },
    { month: "Current", value: studentCount, secondary: studentCount },
  ]);
});

router.get("/charts/attendance-trend", async (_req, res) => {
  res.json([
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Current", value: 0 },
  ]);
});

router.get("/charts/revenue-trend", async (_req, res) => {
  res.json([
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Current", value: 0 },
  ]);
});

// ── 3. Libraries Management ──────────────────────────────────────────────────
router.get("/libraries", async (_req, res) => {
  const libs = await libraryRepo.listAll();
  res.json(libs);
});

// ── 4. Users / Students Management ───────────────────────────────────────────
router.get("/users", async (req, res) => {
  let users = await userRepo.listAll();
  const { role, status, search } = req.query;

  if (role && typeof role === "string") {
    users = users.filter((u) => u.role === role);
  }
  if (status && typeof status === "string") {
    users = users.filter((u) => u.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }

  res.json(users);
});

// ── 5. Payments Management ───────────────────────────────────────────────────
router.get("/payments", async (req, res) => {
  const payments = await paymentRepo.listByLibrary((req.query["libraryId"] as string) || "");
  res.json(payments);
});

// ── 6. Attendance Logs ───────────────────────────────────────────────────────
router.get("/attendance", async (req, res) => {
  const logs = await attendanceRepo.listByLibraryToday((req.query["libraryId"] as string) || "");
  res.json(logs);
});

// ── 7. REMOTE CONFIG & CMS SETTINGS (Rules #53 - #85) ────────────────────────
router.get("/cms/settings", async (_req, res) => {
  const settings = await remoteConfigRepo.getAll();
  res.json(settings);
});

router.patch("/cms/settings/:key", async (req, res) => {
  const { value } = req.body;
  const key = req.params["key"];
  const updated = await remoteConfigRepo.set(key, String(value));

  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "UPDATE_SETTING",
    targetEntity: "remote_config",
    targetId: key,
    newValues: { key, value },
    ipAddress: req.ip,
  });

  res.json(updated);
});

router.post("/cms/settings/bulk", async (req, res) => {
  const { updates } = req.body as { updates: Record<string, string> };
  const result = await remoteConfigRepo.bulkSet(updates || {});

  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "BULK_UPDATE_SETTINGS",
    targetEntity: "remote_config",
    targetId: "bulk",
    newValues: updates,
    ipAddress: req.ip,
  });

  res.json(result);
});

router.post("/cms/settings/publish", async (req, res) => {
  const { changeSummary } = req.body;
  const published = await remoteConfigRepo.publishVersion(changeSummary || "Master Admin Published Configuration");
  res.json(published);
});

router.post("/cms/settings/rollback/:version", async (req, res) => {
  const version = Number(req.params["version"]);
  try {
    const result = await remoteConfigRepo.rollbackToVersion(version);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/cms/settings/versions", async (_req, res) => {
  const history = await remoteConfigRepo.getVersionHistory();
  res.json(history);
});

// ── 8. TARGETED POPUPS & BANNERS (Rules #63 - #66) ───────────────────────────
router.get("/popups", async (_req, res) => {
  const popups = await popupRepo.listAll();
  res.json(popups);
});

router.post("/popups", async (req, res) => {
  const popup = await popupRepo.create(req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "CREATE_POPUP",
    targetEntity: "popup",
    targetId: popup.id,
    newValues: popup,
    ipAddress: req.ip,
  });
  res.status(201).json(popup);
});

router.delete("/popups/:id", async (req, res) => {
  await popupRepo.delete(req.params["id"]);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "DELETE_POPUP",
    targetEntity: "popup",
    targetId: req.params["id"],
    ipAddress: req.ip,
  });
  res.json({ success: true });
});

router.get("/banners", async (_req, res) => {
  const banners = await bannerRepo.listAll();
  res.json(banners);
});

router.post("/banners", async (req, res) => {
  const banner = await bannerRepo.create(req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "CREATE_BANNER",
    targetEntity: "banner",
    targetId: banner.id,
    newValues: banner,
    ipAddress: req.ip,
  });
  res.status(201).json(banner);
});

router.delete("/banners/:id", async (req, res) => {
  await bannerRepo.delete(req.params["id"]);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "DELETE_BANNER",
    targetEntity: "banner",
    targetId: req.params["id"],
    ipAddress: req.ip,
  });
  res.json({ success: true });
});

// ── 9. AUDIT LOGS (Rule #85) ─────────────────────────────────────────────────
router.get("/audit-logs", async (req, res) => {
  const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
  const logs = await auditLogRepo.list({ limit });
  res.json(logs);
});

// ── 10. SECURITY & FRAUD DETECTION (Rules #4, #5, #7) ────────────────────────
router.get("/security/overview", async (_req, res) => {
  const overview = await fraudRepo.getOverview();
  res.json(overview);
});

router.get("/security/events", async (req, res) => {
  const status = (req.query["status"] as string) || undefined;
  const severity = (req.query["severity"] as string) || undefined;
  const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
  const events = await fraudRepo.list({ status, severity, limit });
  res.json(events);
});

router.post("/security/events/:id/action", async (req, res) => {
  const { action, notes } = req.body as { action: "dismiss" | "restrict" | "suspend" | "resolve"; notes?: string };
  const id = req.params["id"];
  const result = await fraudRepo.takeAction(id, action, notes);
  res.json(result);
});

// ── 11. COUPONS & OFFERS (Rule #10) ──────────────────────────────────────────
router.get("/coupons", async (_req, res) => {
  const coupons = await couponRepo.list();
  res.json(coupons);
});

router.post("/coupons", async (req, res) => {
  const coupon = await couponRepo.create(req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "CREATE_COUPON",
    targetEntity: "coupon",
    targetId: coupon.id,
    newValues: coupon,
    ipAddress: req.ip,
  });
  res.status(201).json(coupon);
});

router.delete("/coupons/:id", async (req, res) => {
  await couponRepo.delete(req.params["id"]);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "DELETE_COUPON",
    targetEntity: "coupon",
    targetId: req.params["id"],
    ipAddress: req.ip,
  });
  res.json({ success: true });
});

// ── 12. WHATSAPP TEMPLATES & AUTOMATION (Rule #1) ────────────────────────────
router.get("/whatsapp/templates", async (_req, res) => {
  const templates = await whatsappRepo.listTemplates();
  res.json(templates);
});

router.patch("/whatsapp/templates/:id", async (req, res) => {
  const updated = await whatsappRepo.updateTemplate(req.params["id"], req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "UPDATE_WHATSAPP_TEMPLATE",
    targetEntity: "whatsapp_template",
    targetId: req.params["id"],
    newValues: req.body,
    ipAddress: req.ip,
  });
  res.json(updated);
});

// ── 13. RULES & AUTOMATION ENGINE (Parts 56, 57) ────────────────────────────
router.get("/rules", async (_req, res) => {
  const rules = await rulesEngineRepo.listRules();
  res.json(rules);
});

router.post("/rules", async (req, res) => {
  const rule = await rulesEngineRepo.createRule(req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "CREATE_RULE",
    targetEntity: "rule",
    targetId: rule.id,
    newValues: rule,
    ipAddress: req.ip,
  });
  res.status(201).json(rule);
});

router.delete("/rules/:id", async (req, res) => {
  await rulesEngineRepo.deleteRule(req.params["id"]);
  res.json({ success: true });
});

// ── 14. SUPPORT DESK (Part 61) ───────────────────────────────────────────────
router.get("/support/tickets", async (req, res) => {
  const tickets = await supportTicketRepo.list();
  res.json(tickets);
});

router.post("/support/tickets", async (req, res) => {
  const ticket = await supportTicketRepo.create(req.body);
  res.status(201).json(ticket);
});

router.patch("/support/tickets/:id/status", async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const result = await supportTicketRepo.updateStatus(req.params["id"], status, resolutionNotes);
  res.json(result);
});

// ── 15. SYSTEM HEALTH CENTER (Part 95, 96) ───────────────────────────────────
router.get("/system-health", async (_req, res) => {
  const health = await systemHealthRepo.getHealthOverview();
  res.json(health);
});

// ── 16. DIGITAL TWIN (Parts 16, 17) ──────────────────────────────────────────
router.get("/digital-twin/floors", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "lib_1";
  const floors = await digitalTwinRepo.listFloors(libraryId);
  res.json(floors);
});

router.get("/digital-twin/history", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "lib_1";
  const datetime = (req.query["datetime"] as string) || new Date().toISOString();
  const history = await digitalTwinRepo.getHistoricalOccupancy(libraryId, datetime);
  res.json(history);
});

// ── 17. USER BUGS & INCIDENT CENTER (Reliability & Bug Management) ─────────
router.get("/bugs", async (_req, res) => {
  const bugs = await bugRepo.list();
  res.json(bugs);
});

router.patch("/bugs/:id", async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const result = await bugRepo.updateStatus(req.params["id"], status, resolutionNotes);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "UPDATE_BUG_STATUS",
    targetEntity: "bug_report",
    targetId: req.params["id"],
    newValues: { status, resolutionNotes },
    ipAddress: req.ip,
  });
  res.json(result);
});

// ── 18. CRASHES & TELEMETRY MONITORING ───────────────────────────────────────
router.get("/crashes", async (_req, res) => {
  const crashes = await crashRepo.list();
  res.json(crashes);
});

router.get("/crashes/metrics", async (_req, res) => {
  const metrics = await crashRepo.getMetrics();
  res.json(metrics);
});

// ── 19. INCIDENT MANAGEMENT & AUTOMATION ────────────────────────────────────
router.get("/incidents", async (_req, res) => {
  const incidents = await incidentRepo.list();
  res.json(incidents);
});

router.post("/incidents", async (req, res) => {
  const incident = await incidentRepo.create(req.body);
  await auditLogRepo.record({
    actorId: "admin_001",
    actorName: "Master Admin",
    actorRole: "super_admin",
    action: "CREATE_INCIDENT",
    targetEntity: "incident",
    targetId: incident.id,
    newValues: incident,
    ipAddress: req.ip,
  });
  res.status(201).json(incident);
});

router.patch("/incidents/:id", async (req, res) => {
  const { status, resolution, rootCause } = req.body;
  const result = await incidentRepo.updateStatus(req.params["id"], status, resolution, rootCause);
  res.json(result);
});

// ── 20. NOTIFICATIONS ────────────────────────────────────────────────────────
router.get("/notifications", async (_req, res) => {
  res.json([]);
});

// ── 21. MULTI-FLOOR DIGITAL TWIN & 2D/3D/4D SPATIAL ENGINE ──────────────────
router.get("/digital-twin/floors", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "lib001";
  try {
    const floors = await digitalTwinRepo.getFloors(libraryId);
    res.json(floors);
  } catch (err: any) {
    logger.error({ err }, "Error fetching digital twin floors");
    res.status(500).json({ error: "Failed to fetch floors" });
  }
});

router.get("/digital-twin/history", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || "lib001";
  const datetime = (req.query["datetime"] as string) || undefined;
  try {
    const history = await digitalTwinRepo.getHistory(libraryId, datetime);
    res.json(history);
  } catch (err: any) {
    logger.error({ err }, "Error fetching digital twin history");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.patch("/digital-twin/seats/:seatId/coords", async (req, res) => {
  const { x, y, z } = req.body;
  try {
    const updated = await digitalTwinRepo.updateSeatCoordinates(req.params["seatId"], Number(x), Number(y), z ? Number(z) : 0);
    res.json({ success: true, seat: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating seat coordinates");
    res.status(500).json({ error: "Failed to update seat coordinates" });
  }
});

export default router;
