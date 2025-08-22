import { Router } from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getMyOrder,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getMyOrder);
router.get("/:id", getOrderById);

router.patch("/:id/status", roleCheck(["ADMIN"]), updateOrderStatus);

export default router;
