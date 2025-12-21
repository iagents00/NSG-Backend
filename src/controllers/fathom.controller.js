import User from "../models/user.model.js";
import axios from "axios";

// Guardar el access token de Fathom del usuario
export const saveFathomToken = async (req, res) => {
    try {
        const userId = req.user.id; // Del middleware de autenticación
        const { fathom_access_token } = req.body;

        // Validar que se envió el token
        if (!fathom_access_token) {
            return res.status(400).json({
                success: false,
                message: "La API key de Fathom es requerida",
            });
        }

        // Validar que el token no esté vacío
        if (fathom_access_token.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "La API key de Fathom no puede estar vacía",
            });
        }

        // ===== VALIDAR TOKEN CON FATHOM API =====
        console.log("Validando API key con Fathom Video API...");

        try {
            // Nota: Fathom Video API (fathom.ai) usa X-Api-Key
            const fathomResponse = await axios.get(
                "https://api.fathom.ai/external/v1/meetings",
                {
                    params: { limit: 1 },
                    headers: {
                        "X-Api-Key": fathom_access_token.trim(),
                    },
                }
            );

            console.log(
                "✅ API key validada exitosamente con Fathom Video API"
            );
        } catch (error) {
            const status = error.response?.status;
            const errorMsg = error.response?.data?.error || error.message;

            console.error("Fathom API Error:", status, errorMsg);

            if (status === 401 || status === 403) {
                return res.status(status).json({
                    success: false,
                    message:
                        "API key inválida. Verifica que sea una API key válida de Fathom Video.",
                    details: errorMsg,
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "No se pudo validar la API key con Fathom. Revisa la conexión o intenta de nuevo.",
                error: errorMsg,
            });
        }

        // Actualizar el usuario con el nuevo token
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fathom_access_token: fathom_access_token.trim() },
            { new: true, select: "-password" } // Retornar el usuario actualizado sin la contraseña
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            message: "API key de Fathom validada y guardada exitosamente",
            data: {
                fathom_access_token: updatedUser.fathom_access_token,
            },
        });
    } catch (error) {
        console.error("Error guardando access token de Fathom:", error);
        res.status(500).json({
            success: false,
            message: "Error guardando el access token de Fathom",
            error: error.message,
        });
    }
};

// Obtener el estado de conexión de Fathom del usuario
export const getFathomStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("fathom_access_token");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        const hasToken =
            user.fathom_access_token && user.fathom_access_token.trim() !== "";

        res.status(200).json({
            success: true,
            connected: hasToken,
            data: {
                has_token: hasToken,
            },
        });
    } catch (error) {
        console.error("Error obteniendo estado de Fathom:", error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo el estado de Fathom",
            error: error.message,
        });
    }
};

// Eliminar la API key de Fathom del usuario
export const deleteFathomToken = async (req, res) => {
    try {
        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fathom_access_token: "" },
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            message: "API key de Fathom eliminada exitosamente",
        });
    } catch (error) {
        console.error("Error eliminando API key de Fathom:", error);
        res.status(500).json({
            success: false,
            message: "Error eliminando la API key de Fathom",
            error: error.message,
        });
    }
};

// Obtener la lista de reuniones directamente desde Fathom
export const getFathomMeetings = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Buscar el token del usuario en la BD
        const user = await User.findById(userId).select("fathom_access_token");

        if (!user || !user.fathom_access_token) {
            // Si no hay token, simplemente devolvemos una lista vacía con éxito
            // Esto evita que el frontend entre en un estado de error infinito
            return res.status(200).json([
                {
                    meetings: [],
                },
            ]);
        }

        console.log(
            `Buscando reuniones en Fathom para el usuario ${userId}...`
        );

        // 2. Hacer la petición a la API de Fathom
        try {
            const fathomResponse = await axios.get(
                "https://api.fathom.ai/external/v1/meetings",
                {
                    params: {
                        limit: 20,
                        include_transcript: true,
                        include_summary: true,
                    },
                    headers: {
                        "X-Api-Key": user.fathom_access_token.trim(),
                    },
                }
            );

            // 3. Formatear la respuesta para que el frontend la entienda
            // El frontend espera un array donde cada item tiene { meeting_data, transcription_list }
            const meetings = fathomResponse.data.items.map((item) => ({
                meeting_data: {
                    recording_id: item.recording_id,
                    title: item.title || item.meeting_title,
                    meeting_title: item.meeting_title,
                    default_summary:
                        item.default_summary?.markdown_formatted ||
                        "Sin resumen disponible.",
                    created_at: item.created_at,
                    share_url: item.share_url,
                },
                transcription_list: item.transcript || [],
            }));

            // El frontend actualmente espera un array envoltorio [ { meetings: [...] } ]
            // según la lógica en NSGHorizon.tsx (línea 179)
            res.status(200).json([
                {
                    meetings: meetings,
                },
            ]);
        } catch (fathomError) {
            console.error(
                "Error al consultar la API de Fathom:",
                fathomError.response?.status,
                fathomError.message
            );

            if (fathomError.response?.status === 401) {
                return res.status(401).json({
                    success: false,
                    message: "La API Key de Fathom ha expirado o es inválida.",
                });
            }

            throw fathomError;
        }
    } catch (error) {
        console.error("Error en getFathomMeetings:", error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo las reuniones de Fathom",
            error: error.message,
        });
    }
};
