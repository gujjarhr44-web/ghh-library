import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import ownerRouter from "./owner";
import cmsRouter from "./cms";
import otpRouter from "./otp";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/owner", ownerRouter);
router.use("/admin/cms", cmsRouter);
router.use("/otp", otpRouter);

export default router;
