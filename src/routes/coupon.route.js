import { Router } from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/coupon.controller.js";

const router = Router();

router.use(authMiddleware, roleCheck(["ADMIN"]));

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", deleteCoupon);

export default router;
