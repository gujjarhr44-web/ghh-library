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

// ── 4. GET /api/libraries/:id (Get library detail by ID) ──────────────────────
router.get("/:id", async (req, res) => {
  const lib = await libraryRepo.findById(req.params["id"]);
  if (!lib) {
    return res.status(404).json({ success: false, message: "Library not found" });
  }
  return res.json(lib);
});

// ── 5. POST /api/libraries (Create New Library) ───────────────────────────────
router.post("/", async (req, res) => {
  const {
    name,
    ownerName,
    ownerId,
    address,
    city,
    state = "Haryana",
    pincode = "127306",
    area,
    latitude,
    longitude,
    totalSeats = 60,
    billingMode = "credit",
    facilities = ["AC", "WiFi", "RO Water", "CCTV", "Power Backup"],
    openTime = "06:00 AM",
    closeTime = "11:00 PM",
    googleMapsUrl,
  } = req.body;

  if (!name || !ownerName || !address || !city || !area) {
    return res.status(400).json({ success: false, message: "Name, owner name, address, city, and area are required." });
  }

  try {
    const id = `lib_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const uniqueId = await libraryRepo.generateUniqueLibraryId(pincode);

    const created = await libraryRepo.createLibrary({
      id,
      publicLibraryId: uniqueId.publicLibraryId,
      libraryCode: uniqueId.libraryCode,
      ownerId: ownerId || "usr_owner_default",
      name: name.trim(),
      ownerName: ownerName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: uniqueId.pincode,
      area: area.trim(),
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      googleMapsUrl: googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`,
      rating: "4.8",
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      occupancyRate: 0,
      billingMode,
      facilities,
      openTime,
      closeTime,
      isVerified: true,
      isOpen: true,
    });

    logger.info({ libraryId: created.id, publicLibraryId: created.publicLibraryId }, "New library created");

    return res.status(201).json({
      success: true,
      message: `Library created successfully with Public ID: ${created.publicLibraryId}`,
      library: created,
    });
  } catch (err: any) {
    logger.error({ err }, "Error creating library");
    return res.status(500).json({ success: false, message: err.message || "Failed to create library" });
  }
});

// ── 6. PATCH /api/libraries/:id (Update Library Details) ──────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const updated = await libraryRepo.updateLibrary(req.params["id"], req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }
    return res.json({ success: true, message: "Library updated successfully", library: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating library");
    return res.status(500).json({ success: false, message: err.message || "Failed to update library" });
  }
});

export default router;
