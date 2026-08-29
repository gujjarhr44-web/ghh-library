import { Router } from "express";
import { bugRepo, crashRepo } from "../lib/db-repo";
import { logger } from "../lib/logger";

const router = Router();

// ── 1. POST /api/telemetry/bug (User Submits Problem / Bug Report) ────────────
router.post("/bug", async (req, res) => {
  try {
    const { category, description, priority, userId, userName, libraryId, appVersion, buildNumber, deviceModel, osVersion, screenName, networkState, screenshotUrl } = req.body;
    if (!description || !category) {
      return res.status(400).json({ success: false, message: "Category and description are required." });
    }

    const correlationId = (req.headers["x-correlation-id"] as string) || `req_${Date.now()}`;
    const report = await bugRepo.submit({
      category,
      description,
      priority: priority || "normal",
      userId,
      userName,
      libraryId,
      appVersion,
      buildNumber,
      deviceModel,
      osVersion,
      screenName,
      networkState,
      correlationId,
      screenshotUrl,
    });

    logger.info({ reportId: report.reportId, category, userId }, "User bug report recorded");
    return res.status(201).json({
      success: true,
      message: `Your report ID is ${report.reportId}. Our engineering team has received the diagnostics.`,
      report,
    });
  } catch (err: any) {
    logger.error({ err }, "Error recording user bug report");
    return res.status(500).json({ success: false, message: "Failed to submit bug report" });
  }
});

// ── 2. POST /api/telemetry/crash (Automatic Production Crash Ingestion) ───────
router.post("/crash", async (req, res) => {
  try {
    const { crashType, message, stackTrace, screenName, appVersion, buildNumber, deviceModel, osVersion, severity } = req.body;
    const crash = await crashRepo.recordCrash({
      crashType: crashType || "UnhandledException",
      message: message || "Application crashed",
      stackTrace,
      screenName,
      appVersion,
      buildNumber,
      deviceModel,
      osVersion,
      severity: severity || "high",
    });

    logger.warn({ fingerprint: crash.fingerprint, crashType, screenName }, "Automatic crash event ingested");
    return res.status(201).json({ success: true, fingerprint: crash.fingerprint });
  } catch (err: any) {
    logger.error({ err }, "Error recording crash event");
    return res.status(500).json({ success: false, message: "Crash logging failed" });
  }
});

export default router;
