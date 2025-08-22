import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, roleCheck(["ADMIN"]), createProduct);
router.put("/:id", authMiddleware, roleCheck(["ADMIN"]), updateProduct);
router.delete("/:id", authMiddleware, roleCheck(["ADMIN"]), deleteProduct);

export default router;
