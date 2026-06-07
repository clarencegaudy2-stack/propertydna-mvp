import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dealsRouter from "./deals";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/deals", dealsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);

export default router;
