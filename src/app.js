import express from "express";
import morgan from "morgan";
import cookie_parser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

//routers
import auth_routes from "./routes/auth.routes.js";
import user_routes from "./routes/user.routes.js";
import fathom_routes from "./routes/fathom.routes.js";
import google_routes from "./routes/google.routes.js";

const app = express();

app.use(
    cors({
        // origin: 'http://localhost:5173',
        origin: "*",
        credentials: true, // ¡Importante!
    })
);

// Configurar morgan para mostrar los registros de las solicitudes en el formato 'dev'
app.use(morgan("dev"));

// Configurar el middleware para parsear solicitudes JSON
app.use(express.json());

// Middleware para mostrar detalles de cada solicitud
app.use((req, res, next) => {
    console.log("═══════════════════════════════════════");
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    if (Object.keys(req.body || {}).length > 0) {
        console.log("Body:", JSON.stringify(req.body, null, 2));
    }
    console.log("═══════════════════════════════════════");
    next();
});

app.use(cookie_parser());

// Deshabilitar caché para todas las rutas
app.use((req, res, next) => {
    res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
    });
    next();
});

// Ruta raíz
app.get("/", (req, res) => {
    res.send("Bienvenido");
});

// Configurar las rutas de autenticación de usuarios con el prefijo '/auth'
app.use("/auth", auth_routes);
// Configurar las rutas de autenticación de usuarios con el prefijo '/user'
app.use("/user", user_routes);
// Configurar las rutas de Fathom Analytics con el prefijo '/fathom'
app.use("/fathom", fathom_routes);
// Configurar las rutas de Google Calendar con el prefijo '/google'
app.use("/google", google_routes);

export default app;
