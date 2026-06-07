import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import dealsRouter from "./deals.js";
import dashboardRouter from "./dashboard.js";
import adminRouter from "./admin.js";
import meRouter from "./me.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/me", meRouter);
router.use("/deals", dealsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);

export default router;
