import { Router } from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/", roleCheck(["ADMIN"]), getDashboardStats);

export default router;
