import { Router } from "express";
import { remoteConfigRepo } from "../lib/db-repo";

const router = Router();

// ── GET /api/config/live (Merged Active Configuration for APK & Clients) ─────
router.get("/live", async (req, res) => {
  const libraryId = (req.query["libraryId"] as string) || undefined;
  const config = await remoteConfigRepo.getMergedLiveConfig(libraryId);
  res.json({
    success: true,
    version: config["app.current_version"] || "1.0.0",
    config,
    timestamp: new Date().toISOString(),
  });
});

export default router;
