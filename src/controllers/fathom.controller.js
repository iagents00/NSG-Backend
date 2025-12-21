import User from "../models/user.model.js";

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
        console.log("Validando token con Fathom API...");

        try {
            // Hacer una petición de prueba a la API de Fathom
            const fathomResponse = await fetch(
                "https://api.fathom.video/v1/recordings?limit=1",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${fathom_access_token.trim()}`,
                    },
                }
            );

            if (!fathomResponse.ok) {
                const errorText = await fathomResponse.text();
                console.error(
                    "Fathom API Error:",
                    fathomResponse.status,
                    errorText
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "API key inválida. Verifica que sea una API key válida de Fathom.",
                    details: `Error ${fathomResponse.status}`,
                });
            }

            console.log("✅ Token validado exitosamente con Fathom API");
        } catch (fetchError) {
            console.error("Error validando con Fathom API:", fetchError);
            return res.status(500).json({
                success: false,
                message:
                    "No se pudo validar el token con Fathom. Intenta de nuevo.",
                error: fetchError.message,
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
