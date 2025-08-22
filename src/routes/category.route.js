import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin Routes
router.post("/", authMiddleware, roleCheck(["ADMIN"]), createCategory);
router.put("/:id", authMiddleware, roleCheck(["ADMIN"]), updateCategory);
router.delete("/:id", authMiddleware, roleCheck(["ADMIN"]), deleteCategory);

export default router;
