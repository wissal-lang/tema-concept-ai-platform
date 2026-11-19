import { Router } from "express";
import {
  getAllSettings,
  getSettingByKey,
  getSettingsMeta,
  resetAllSettings,
  resetSetting,
  updateSetting,
  updateSettingsBulk,
} from "../controllers/settings.controller.js";
import authMiddleware, { requireAdminRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(requireAdminRole("SUPER_ADMIN", "ADMIN"));

router.get("/meta", getSettingsMeta);
router.post("/reset", resetAllSettings);
router.get("/", getAllSettings);
router.patch("/", updateSettingsBulk);
router.put("/:key", updateSetting);
router.get("/:key", getSettingByKey);
router.delete("/:key", resetSetting);

export default router;
