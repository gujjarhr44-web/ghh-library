import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import ownerRouter from "./owner";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/owner", ownerRouter);

export default router;
