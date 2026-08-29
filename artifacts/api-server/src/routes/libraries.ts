import { Router } from "express";
import { logger } from "../lib/logger";
import { libraryRepo } from "../lib/db-repo";

const router = Router();

// Haversine distance calculator
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ── 1. GET /api/libraries/search-by-id (Unique Library ID & PIN Search) ───────
router.get("/search-by-id", async (req, res) => {
  const query = (req.query["query"] as string) || "";
  const results = await libraryRepo.searchByLibraryId(query);
  return res.json(results);
});

// ── 2. POST /api/libraries/generate-id (Generate Box-Based Unique Library ID) 
router.post("/generate-id", async (req, res) => {
  const { pincode } = req.body;
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return res.status(400).json({ success: false, message: "Valid 6-digit Indian PIN code is required." });
  }

  const generated = await libraryRepo.generateUniqueLibraryId(pincode.trim());
  return res.json({
    success: true,
    ...generated,
  });
});

// ── 3. GET /api/libraries (List all libraries) ────────────────────────────────
router.get("/", async (req, res) => {
  const { userLat, userLng, city, search } = req.query;
  let libraries = await libraryRepo.listAll();

  if (city && typeof city === "string" && city !== "All Cities") {
    libraries = libraries.filter((l) => l.city.toLowerCase() === city.toLowerCase());
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    libraries = libraries.filter(
      (l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.area.toLowerCase().includes(q)
    );
  }

  // If user coordinates provided, compute distanceKm
  if (userLat && userLng) {
    const lat = Number(userLat);
    const lng = Number(userLng);
    const withDistance = libraries.map((lib) => {
      const distanceKm =
        lib.latitude && lib.longitude ? calculateDistanceKm(lat, lng, Number(lib.latitude), Number(lib.longitude)) : undefined;
      return { ...lib, distanceKm };
    });
    return res.json(withDistance.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)));
  }

  return res.json(libraries);
});

// ── 2. GET /api/libraries/:id (Get library detail by ID) ──────────────────────
router.get("/:id", async (req, res) => {
  const lib = await libraryRepo.findById(req.params["id"]);
  if (!lib) {
    return res.status(404).json({ success: false, message: "Library not found" });
  }
  return res.json(lib);
});

export default router;
