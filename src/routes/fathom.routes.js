import { Router } from "express";
import {
    saveFathomToken,
    getFathomStatus,
    deleteFathomToken,
} from "../controllers/fathom.controller.js";
import { auth_required } from "../middlewares/validate_token.js";

const fathom_router = Router();

// Guardar access token de Fathom
fathom_router.post("/token", auth_required, saveFathomToken);

// Obtener estado de conexión de Fathom
fathom_router.get("/status", auth_required, getFathomStatus);

// Eliminar access token de Fathom
fathom_router.delete("/token", auth_required, deleteFathomToken);

export default fathom_router;
