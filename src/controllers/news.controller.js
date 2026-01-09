import News from "../models/news.model.js";
import User from "../models/user.model.js";
import axios from "axios";

export const getNews = async (req, res) => {
    try {
        const { date, type } = req.query; // type can be 'analyzed' or 'latest' (default to today logic if simple)

        let query = {};

        if (type === 'analyzed') {
            // Show news that HAVE an analysis
            query = {
                analysis: { $exists: true, $ne: "" }
            };
        } else {
            // Default behavior: Show "Today's" news (Inteligencia de Mercado view)
            // Or just general news if no specific date is provided, but user asked for "Noticias del día de hoy" specifically for that tab.

            // To be safe and robust, let's default to today IF no specific date passed, 
            // OR if the user just wants "latest" we might just show recent ones.
            // But per request: "en Inteligencia de mercado solamente se mostraran las noticias del dia de hoy"

            const targetDate = date ? new Date(date) : new Date(); // Default to today

            // Calculate start and end of the target day in UTC (or local if simpler, but keep consistent)
            // Since `date` field in model is String "YYYY-MM-DD", let's try to match that string first for simplicity if possible,
            // OR use createdAt ranges. The Model has a `date` string field.

            const dateString = targetDate.toISOString().split('T')[0]; // "2026-01-09"

            query = {
                $or: [
                    { date: dateString }, // Match string format
                    // Fallback to createdAt range if needed, but let's stick to the explicit date field first as it seems to be the business logic
                ]
            };
        }

        // Fetch news sorted by date descending (newest first)
        const news = await News.find(query).sort({ date: -1, createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createNews = async (req, res) => {
    try {
        const newNews = new News(req.body);
        const savedNews = await newNews.save();
        res.status(201).json(savedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const analyzeNews = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log("Analyze News triggered for news ID:", id);
        console.log("Logged in User ID:", userId);

        if (!id) {
            return res
                .status(400)
                .json({ message: "El ID de la noticia es requerido" });
        }

        // Fetch user to get telegram_id
        const user = await User.findById(userId);
        console.log("User found in DB:", user ? "Yes" : "No");

        const telegramId = user?.telegram_id || null;
        console.log("Telegram ID to be sent:", telegramId);

        // Forwarding to n8n webhook
        const n8nWebhookUrl =
            "https://personal-n8n.suwsiw.easypanel.host/webhook/analyze-news";

        const payload = {
            id,
            telegram_id: telegramId,
        };
        console.log("Sending payload to n8n:", JSON.stringify(payload));

        const response = await axios.post(n8nWebhookUrl, payload);

        // Just return the n8n response (which is used for notification)
        res.json(response.data);
    } catch (error) {
        console.error("Error calling n8n:", error.message);
        if (error.response) {
            console.error("n8n response error data:", error.response.data);
        }
        res.status(500).json({
            message: "Error al procesar el análisis estratégico",
            error: error.message,
        });
    }
};
