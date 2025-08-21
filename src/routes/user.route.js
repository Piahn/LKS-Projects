import { Router } from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.middleware.js";
import { getAllUsers, getMyProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfile);

router.get("/", authMiddleware, roleCheck(["ADMIN"]), getAllUsers);

export default router;
