import { Router } from "express";
import {
  getAllSettings,
  getSettingsByCategory,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  deleteSetting,
  resetToDefaults,
  type SettingCategory,
} from "../lib/cms-store";

const router = Router();

// GET /api/admin/cms/settings — सब settings
router.get("/settings", (_req, res) => {
  const settings = getAllSettings();
  res.json(settings);
});

// GET /api/admin/cms/export — settings export as JSON
router.get("/settings/export", (_req, res) => {
  const settings = getAllSettings();
  res.setHeader("Content-Disposition", "attachment; filename=app-settings.json");
  res.setHeader("Content-Type", "application/json");
  res.json(settings);
});

// GET /api/admin/cms/settings/by-category/:category
router.get("/settings/by-category/:category", (req, res) => {
  const category = req.params["category"] as SettingCategory;
  res.json(getSettingsByCategory(category));
});

// POST /api/admin/cms/settings — create or update one setting
router.post("/settings", (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    res.status(400).json({ error: "key and value are required" });
    return;
  }
  const updated = updateSetting(String(key), String(value));
  res.json(updated);
});

// POST /api/admin/cms/settings/bulk — batch update multiple settings
router.post("/settings/bulk", (req, res) => {
  const updates = req.body as Record<string, string>;
  if (typeof updates !== "object" || Array.isArray(updates)) {
    res.status(400).json({ error: "Body must be an object of { key: value } pairs" });
    return;
  }
  const updated = bulkUpdateSettings(updates);
  res.json({ updated: updated.length, settings: updated });
});

// POST /api/admin/cms/settings/import — settings import from JSON
router.post("/settings/import", (req, res) => {
  const settings = req.body;
  if (!Array.isArray(settings)) {
    res.status(400).json({ error: "Body must be an array of settings" });
    return;
  }
  const updates: Record<string, string> = {};
  for (const s of settings) {
    if (s.key && s.value !== undefined) {
      updates[s.key] = String(s.value);
    }
  }
  const updated = bulkUpdateSettings(updates);
  res.json({ imported: updated.length, settings: getAllSettings() });
});

// GET /api/admin/cms/settings/:key — एक setting (using :key param, dots allowed via encode)
router.get("/settings/:key", (req, res) => {
  const key = decodeURIComponent(req.params["key"] ?? "");
  const setting = getSetting(key);
  if (!setting) {
    res.status(404).json({ error: "Setting not found", key });
    return;
  }
  res.json(setting);
});

// PUT /api/admin/cms/settings/:key — update one setting by key
router.put("/settings/:key", (req, res) => {
  const key = decodeURIComponent(req.params["key"] ?? "");
  const { value } = req.body;
  if (value === undefined) {
    res.status(400).json({ error: "value is required" });
    return;
  }
  const updated = updateSetting(key, String(value));
  res.json(updated);
});

// DELETE /api/admin/cms/settings/:key — delete a setting
router.delete("/settings/:key", (req, res) => {
  const key = decodeURIComponent(req.params["key"] ?? "");
  const deleted = deleteSetting(key);
  if (!deleted) {
    res.status(404).json({ error: "Setting not found" });
    return;
  }
  res.json({ success: true, key });
});

// POST /api/admin/cms/reset — सब settings reset to defaults
router.post("/reset", (_req, res) => {
  resetToDefaults();
  res.json({ success: true, message: "All settings reset to defaults", settings: getAllSettings() });
});

export default router;
