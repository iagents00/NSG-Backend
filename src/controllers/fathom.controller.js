import FathomService from "../libs/fathom.js";

// ========== CONTROLADORES OAUTH ==========

// Iniciar proceso OAuth - redirigir a Fathom
export const initiateOAuth = async (req, res) => {
  try {
    const userId = req.user.id; // Del middleware de autenticación

    const authUrl = await FathomService.generateAuthUrl(userId);

    res.redirect(authUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error iniciando proceso de autorización",
      error: error.message,
    });
  }
};

// Manejar callback de OAuth
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // Si Fathom devuelve un error
    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard?error=missing_params`
      );
    }

    // Validar estado y obtener userId
    const userId = await FathomService.validateOAuthState(state);

    // Intercambiar código por token
    await FathomService.exchangeCodeForToken(code, userId);

    // Redirigir al frontend con éxito
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=true`);
  } catch (error) {
    console.error("Error en callback OAuth:", error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`);
  }
};

// Verificar estado de conexión
export const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const isConnected = await FathomService.hasActiveConnection(userId);

    res.status(200).json({
      success: true,
      connected: isConnected,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verificando estado de conexión",
      error: error.message,
    });
  }
};

// Desconectar cuenta de Fathom
export const disconnectAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await FathomService.disconnectAccount(userId);

    res.status(200).json({
      success: true,
      message: "Cuenta de Fathom desconectada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error desconectando cuenta de Fathom",
      error: error.message,
    });
  }
};

// ========== CONTROLADORES DE DATOS DE USUARIO ==========

// Obtener sitios del usuario conectado
export const getUserSites = async (req, res) => {
  try {
    const userId = req.user.id;

    const sites = await FathomService.getUserSites(userId);

    res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo sitios del usuario",
      error: error.message,
    });
  }
};

// Obtener estadísticas de sitio del usuario
export const getUserSiteStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { siteId } = req.params;
    const { from, to, entity, entity_id, aggregates, timezone, limit } =
      req.query;

    // Construir parámetros de consulta
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (entity) params.entity = entity;
    if (entity_id) params.entity_id = entity_id;
    if (aggregates) params.aggregates = aggregates;
    if (timezone) params.timezone = timezone;
    if (limit) params.limit = limit;

    const stats = await FathomService.getUserSiteStats(userId, siteId, params);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del sitio del usuario",
      error: error.message,
    });
  }
};

// Obtener estadísticas resumidas para dashboard del usuario
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { siteId } = req.params;
    const { period = "7d" } = req.query;

    // Calcular fechas basadas en el período
    const now = new Date();
    const from = new Date();

    switch (period) {
      case "24h":
        from.setDate(now.getDate() - 1);
        break;
      case "7d":
        from.setDate(now.getDate() - 7);
        break;
      case "30d":
        from.setDate(now.getDate() - 30);
        break;
      case "90d":
        from.setDate(now.getDate() - 90);
        break;
      default:
        from.setDate(now.getDate() - 7);
    }

    const params = {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
      aggregates: "visits,uniques,pageviews,avg_duration,bounce_rate",
    };

    const stats = await FathomService.getUserSiteStats(userId, siteId, params);

    res.status(200).json({
      success: true,
      period,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del dashboard del usuario",
      error: error.message,
    });
  }
};

// ========== CONTROLADORES LEGACY (ADMIN CON API KEY) ==========

// Obtener todos los sitios de Fathom (solo admin con API key)
export const getSites = async (req, res) => {
  try {
    const sites = await FathomService.getSites();

    res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo sitios de Fathom",
      error: error.message,
    });
  }
};

// Obtener estadísticas de un sitio específico (admin con API key)
export const getSiteStats = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { from, to, entity, entity_id, aggregates, timezone, limit } =
      req.query;

    // Construir parámetros de consulta
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (entity) params.entity = entity;
    if (entity_id) params.entity_id = entity_id;
    if (aggregates) params.aggregates = aggregates;
    if (timezone) params.timezone = timezone;
    if (limit) params.limit = limit;

    const stats = await FathomService.getSiteStats(siteId, params);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del sitio",
      error: error.message,
    });
  }
};

// Crear evento personalizado (admin con API key)
export const trackEvent = async (req, res) => {
  try {
    const { siteId } = req.params;
    const eventData = req.body;

    const result = await FathomService.trackEvent(siteId, eventData);

    res.status(201).json({
      success: true,
      message: "Evento creado exitosamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando evento en Fathom",
      error: error.message,
    });
  }
};

// Obtener estadísticas resumidas (admin con API key)
export const getDashboardStats = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = "7d" } = req.query;

    // Calcular fechas basadas en el período
    const now = new Date();
    const from = new Date();

    switch (period) {
      case "24h":
        from.setDate(now.getDate() - 1);
        break;
      case "7d":
        from.setDate(now.getDate() - 7);
        break;
      case "30d":
        from.setDate(now.getDate() - 30);
        break;
      case "90d":
        from.setDate(now.getDate() - 90);
        break;
      default:
        from.setDate(now.getDate() - 7);
    }

    const params = {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
      aggregates: "visits,uniques,pageviews,avg_duration,bounce_rate",
    };

    const stats = await FathomService.getSiteStats(siteId, params);

    res.status(200).json({
      success: true,
      period,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del dashboard",
      error: error.message,
    });
  }
};
