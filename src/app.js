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
import telegram_routes from "./routes/telegram.routes.js";
import news_routes from "./routes/news.routes.js";
import strategy_routes from "./routes/strategy.routes.js";
import transcription_routes from "./routes/transcription.routes.js";
import health_routes from "./routes/health.routes.js";
import clarity_routes from "./routes/clarity.routes.js";

// middlewares
import { errorHandler, notFoundHandler } from "./middlewares/error_handler.js";

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
// Configurar las rutas de Telegram con el prefijo '/telegram'
app.use("/telegram", telegram_routes);
// Configurar las rutas de News con el prefijo '/news'
app.use("/news", news_routes);
// Configurar las rutas de Estrategias con el prefijo '/strategies'
app.use("/strategies", strategy_routes);
// Configurar las rutas de Transcripciones con el prefijo '/transcriptions'
app.use("/transcriptions", transcription_routes);
// Configurar las rutas de Health Check con el prefijo '/health'
app.use("/health", health_routes);
// Configurar las rutas de Clarity con el prefijo '/clarity'
app.use("/clarity", clarity_routes);

// Middleware de manejo de rutas no encontradas (debe estar después de todas las rutas)
app.use(notFoundHandler);

// Middleware de manejo de errores global (debe estar al final)
app.use(errorHandler);

export default app;
