import { Router } from "express";
import { getTelegramUserByTelegramId } from "../controllers/telegram.controller.js";
import { auth_required } from "../middlewares/validate_token.js";

const router = Router();

// Assuming this might be a protected route, but user didn't specify.
// I'll add auth_required just in case, or leave it public if they want to fetch it before login.
// Actually, for "matching" it might be public or private.
// Given the context of the previous conversation about integration, I'll keep it protected for now.
router.get("/:id", auth_required, getTelegramUserByTelegramId);

export default router;
