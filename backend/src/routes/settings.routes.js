import { Router } from "express";
import { getAllSettings, updateSetting } from "../controllers/settings.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAllSettings);
router.put("/:key", authMiddleware, updateSetting);

export default router;
