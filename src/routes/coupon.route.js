import { Router } from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/coupon.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", roleCheck(["ADMIN"]), createCoupon);
router.get("/", getAllCoupons);
router.delete("/:id", roleCheck(["ADMIN"]), deleteCoupon);

export default router;
