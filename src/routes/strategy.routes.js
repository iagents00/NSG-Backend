import { Router } from "express";
import { get_user_strategies } from "../controllers/strategy.controller.js";
import { auth_required } from "../middlewares/validate_token.js";

const strategy_router = Router();

strategy_router.get("/get", auth_required, get_user_strategies);

export default strategy_router;
