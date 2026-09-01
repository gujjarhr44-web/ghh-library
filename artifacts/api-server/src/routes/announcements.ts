import { Router } from "express";
import { logger } from "../lib/logger";
import { broadcastRealtime } from "../lib/realtime";

const router = Router();

export interface AnnouncementItem {
  id: string;
  libraryId: string;
  title: string;
  message: string;
  targetGroup: "all" | "active" | "shift";
  targetShiftName?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "owner" | "admin" | "system";
  action: string;
  targetEntity: string;
  targetId: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export const announcementsStore: AnnouncementItem[] = [
  {
    id: "ann_001",
    libraryId: "lib001",
    title: "Upcoming Holiday Notice",
    message: "Library will be open on Sundays with special morning shift timings (07:00 AM to 01:00 PM).",
    targetGroup: "all",
    createdAt: new Date().toISOString(),
  }
];

export const auditLogsStore: AuditLogItem[] = [
  {
    id: "audit_001",
    actorId: "u002",
    actorName: "Priya Patel",
    actorRole: "owner",
    action: "SEAT_MANUAL_REASSIGN",
    targetEntity: "seat",
    targetId: "A-12",
    oldValues: { student: "Arjun Sharma", status: "occupied" },
    newValues: { student: "Arjun Sharma", status: "occupied", shift: "Morning" },
    reason: "Shift preference adjustment requested by student",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

// ── 1. GET /api/announcements ────────────────────────────────────────────────
router.get("/", (req, res) => {
  const { libraryId } = req.query;
  const items = libraryId
    ? announcementsStore.filter((a) => a.libraryId === libraryId)
    : announcementsStore;
  return res.json({ success: true, announcements: items });
});

// ── 2. POST /api/announcements (Owner Broadcast Announcement) ────────────────
router.post("/", (req, res) => {
  const { libraryId, title, message, targetGroup, targetShiftName } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required" });
  }

  const announcement: AnnouncementItem = {
    id: `ann_${Date.now()}`,
    libraryId: libraryId || "lib001",
    title,
    message,
    targetGroup: targetGroup || "all",
    targetShiftName,
    createdAt: new Date().toISOString(),
  };

  announcementsStore.unshift(announcement);
  broadcastRealtime("announcement:broadcast", announcement);
  logger.info({ announcement }, "Announcement broadcasted via WebSockets");

  return res.status(201).json({
    success: true,
    message: `Announcement broadcasted to ${targetGroup ? targetGroup.toUpperCase() : "ALL"} students.`,
    announcement,
  });
});

// ── 3. GET /api/announcements/audit-logs ─────────────────────────────────────
router.get("/audit-logs", (_req, res) => {
  return res.json({ success: true, logs: auditLogsStore });
});

// ── 4. POST /api/announcements/audit-log (Record Manual Admin/Owner Override)
router.post("/audit-log", (req, res) => {
  const { actorId, actorName, actorRole, action, targetEntity, targetId, oldValues, newValues, reason } = req.body;

  const log: AuditLogItem = {
    id: `audit_${Date.now()}`,
    actorId: actorId || "owner",
    actorName: actorName || "Manager",
    actorRole: actorRole || "owner",
    action: action || "MANUAL_OVERRIDE",
    targetEntity: targetEntity || "system",
    targetId: targetId || "id",
    oldValues,
    newValues,
    reason: reason || "Administrative action",
    createdAt: new Date().toISOString(),
  };

  auditLogsStore.unshift(log);
  logger.info({ log }, "Immutable audit log recorded");

  return res.status(201).json({ success: true, log });
});

export default router;
