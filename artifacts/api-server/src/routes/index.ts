import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import adminRouter from "./admin";
import ownerRouter from "./owner";
import cmsRouter from "./cms";
import otpRouter from "./otp";
import studentRouter from "./student";
import paymentsRouter from "./payments";
import bookingsRouter from "./bookings";
import attendanceRouter from "./attendance";
import librariesRouter from "./libraries";
import aiRouter from "./ai";
import announcementsRouter from "./announcements";
import publicConfigRouter from "./public-config";
import telemetryRouter from "./telemetry";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/owner", ownerRouter);
router.use("/admin/cms", cmsRouter);
router.use("/config", publicConfigRouter);
router.use("/telemetry", telemetryRouter);
router.use("/otp", otpRouter);
router.use("/student", studentRouter);
router.use("/payments", paymentsRouter);
router.use("/bookings", bookingsRouter);
router.use("/attendance", attendanceRouter);
router.use("/libraries", librariesRouter);
router.use("/ai", aiRouter);
router.use("/announcements", announcementsRouter);

export default router;
