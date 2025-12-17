import { Router } from "express";

// Controllers
import {
  // OAuth Controllers
  initiateOAuth,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectAccount,

  // User Data Controllers
  getUserSites,
  getUserSiteStats,
  getUserDashboardStats,

  // Legacy Admin Controllers (con API key)
  getSites,
  getSiteStats,
  trackEvent,
  getDashboardStats,
} from "../controllers/fathom.controller.js";

// Middlewares
import {
  auth_required,
  admin_required,
} from "../middlewares/validate_token.js";

const fathom_router = Router();

// ========== RUTAS OAUTH ==========

// Iniciar proceso OAuth (requiere autenticación)
fathom_router.get("/connect", auth_required, initiateOAuth);

// Callback de OAuth (público, maneja su propia validación)
fathom_router.get("/callback", handleOAuthCallback);

// Verificar estado de conexión
fathom_router.get("/connection/status", auth_required, getConnectionStatus);

// Desconectar cuenta de Fathom
fathom_router.delete("/connection", auth_required, disconnectAccount);

// ========== RUTAS DE DATOS DE USUARIO ==========

// Obtener sitios del usuario conectado
fathom_router.get("/user/sites", auth_required, getUserSites);

// Obtener estadísticas de sitio del usuario
fathom_router.get("/user/sites/:siteId/stats", auth_required, getUserSiteStats);

// Obtener estadísticas resumidas para dashboard del usuario
fathom_router.get(
  "/user/sites/:siteId/dashboard",
  auth_required,
  getUserDashboardStats
);

// ========== RUTAS LEGACY (ADMIN CON API KEY) ==========

// Obtener todos los sitios (requiere autenticación de admin)
fathom_router.get("/admin/sites", auth_required, admin_required, getSites);

// Obtener estadísticas de un sitio específico (admin)
fathom_router.get(
  "/admin/sites/:siteId/stats",
  auth_required,
  admin_required,
  getSiteStats
);

// Obtener estadísticas resumidas para dashboard (admin)
fathom_router.get(
  "/admin/sites/:siteId/dashboard",
  auth_required,
  admin_required,
  getDashboardStats
);

// Crear evento personalizado (admin)
fathom_router.post(
  "/admin/sites/:siteId/events",
  auth_required,
  admin_required,
  trackEvent
);

export default fathom_router;
