// Servicio para manejar la conexión con Fathom Analytics y OAuth
import crypto from "crypto";
import { OAuthState, FathomToken } from "../models/fathom.model.js";

const FATHOM_API_URL = "https://fathom.video/external/v1";
const FATHOM_API_KEY = "TU_FATHOM_API_KEY";
const FATHOM_CLIENT_ID = "NrRk5m9NohU_t6nODvkSZD-sufh9cRp4Nh_gsRe9--U";
const FATHOM_CLIENT_SECRET = "TU_FATHOM_CLIENT_SECRET";
const APP_URL = "https://nsg-backend.onrender.com";

class FathomService {
  constructor() {
    if (!FATHOM_CLIENT_ID || !FATHOM_CLIENT_SECRET) {
      console.warn(
        "⚠️ FATHOM_CLIENT_ID y FATHOM_CLIENT_SECRET deben estar configurados para OAuth"
      );
    }
  }

  // ========== MÉTODOS OAUTH ==========

  // Generar URL de autorización OAuth
  async generateAuthUrl(userId) {
    try {
      // Generar estado único
      const state = crypto.randomBytes(32).toString("hex");

      // Guardar estado en BD
      await OAuthState.create({
        userId,
        state,
      });

      const redirectUri = `${APP_URL}/fathom/callback`;
      const authUrl =
        `${FATHOM_API_URL}/oauth2/authorize?` +
        `client_id=${FATHOM_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=public_api&` +
        `state=${state}`;

      return authUrl;
    } catch (error) {
      console.error("Error generando URL de autorización:", error);
      throw error;
    }
  }

  // Validar estado OAuth y obtener userId
  async validateOAuthState(state) {
    try {
      const oauthState = await OAuthState.findOne({ state });

      if (!oauthState) {
        throw new Error("Estado OAuth inválido o expirado");
      }

      const userId = oauthState.userId;

      // Eliminar el estado usado
      await OAuthState.deleteOne({ _id: oauthState._id });

      return userId;
    } catch (error) {
      console.error("Error validando estado OAuth:", error);
      throw error;
    }
  }

  // Intercambiar código por token de acceso
  async exchangeCodeForToken(code, userId) {
    try {
      const redirectUri = `${APP_URL}/fathom/callback`;

      const response = await fetch(`${FATHOM_API_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: FATHOM_CLIENT_ID,
          client_secret: FATHOM_CLIENT_SECRET,
          redirect_uri: redirectUri,
          code,
          grant_type: "authorization_code",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const tokenData = await response.json();

      // Guardar token en BD
      await FathomToken.findOneAndUpdate(
        { userId },
        {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type || "Bearer",
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          scope: tokenData.scope || "read",
          connectedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return tokenData;
    } catch (error) {
      console.error("Error intercambiando código por token:", error);
      throw error;
    }
  }

  // Obtener token de usuario
  async getUserToken(userId) {
    try {
      const tokenRecord = await FathomToken.findOne({ userId });

      if (!tokenRecord) {
        throw new Error("No se encontró token de Fathom para este usuario");
      }

      // Verificar si el token ha expirado
      if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
        throw new Error("Token de Fathom expirado");
      }

      return tokenRecord.accessToken;
    } catch (error) {
      console.error("Error obteniendo token de usuario:", error);
      throw error;
    }
  }

  // Verificar si usuario tiene conexión activa
  async hasActiveConnection(userId) {
    try {
      const tokenRecord = await FathomToken.findOne({ userId });

      if (!tokenRecord) return false;

      // Verificar si no ha expirado
      if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verificando conexión activa:", error);
      return false;
    }
  }

  // Desconectar cuenta de Fathom
  async disconnectAccount(userId) {
    try {
      await FathomToken.deleteOne({ userId });
      return true;
    } catch (error) {
      console.error("Error desconectando cuenta:", error);
      throw error;
    }
  }

  // ========== MÉTODOS API CON TOKEN DE USUARIO ==========

  // Configuración de headers con token de usuario
  async getUserHeaders(userId) {
    const token = await this.getUserToken(userId);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Obtener sitios del usuario
  async getUserSites(userId) {
    try {
      const headers = await this.getUserHeaders(userId);

      const response = await fetch(`${FATHOM_API_URL}/sites`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo sitios del usuario:", error);
      throw error;
    }
  }

  // Obtener estadísticas de sitio del usuario
  async getUserSiteStats(userId, siteId, params = {}) {
    try {
      const headers = await this.getUserHeaders(userId);
      const queryParams = new URLSearchParams(params);
      const url = `${FATHOM_API_URL}/sites/${siteId}/stats?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo estadísticas del usuario:", error);
      throw error;
    }
  }

  // ========== MÉTODOS LEGACY (con API KEY) ==========

  // Configuración base para las peticiones con API Key
  getHeaders() {
    return {
      Authorization: `Bearer ${FATHOM_API_KEY}`,
      "Content-Type": "application/json",
    };
  }

  // Obtener sitios (con API Key)
  async getSites() {
    try {
      const response = await fetch(`${FATHOM_API_URL}/sites`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo sitios de Fathom:", error);
      throw error;
    }
  }

  // Obtener estadísticas de un sitio (con API Key)
  async getSiteStats(siteId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const url = `${FATHOM_API_URL}/sites/${siteId}/stats?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo estadísticas de Fathom:", error);
      throw error;
    }
  }

  // Crear evento personalizado (con API Key)
  async trackEvent(siteId, eventData) {
    try {
      const response = await fetch(`${FATHOM_API_URL}/sites/${siteId}/events`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creando evento en Fathom:", error);
      throw error;
    }
  }
}

export default new FathomService();
