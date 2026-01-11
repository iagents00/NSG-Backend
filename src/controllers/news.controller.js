import News from "../models/news.model.js";
import User from "../models/user.model.js";
import axios from "axios";

export const getNews = async (req, res) => {
    try {
        const { date, type } = req.query;
        console.log(`[NewsController] Fetching news. Query:`, { date, type });

        let query = {};

        if (type === "analyzed") {
            query = {
                analysis: { $exists: true, $ne: "" },
            };
        } else {
            const targetDate = date ? new Date(date) : new Date();
            const dateString = targetDate.toISOString().split("T")[0];
            console.log(`[NewsController] Target date string: ${dateString}`);

            query = {
                $or: [{ date: dateString }],
            };
        }

        let news = await News.find(query).sort({ date: -1, createdAt: -1 });
        console.log(
            `[NewsController] Initial fetch returned ${news.length} items.`
        );

        // FALLBACK: If "Inteligencia de Mercado" (default tab) is empty, fetch latest 15 regardless of date
        if (news.length === 0 && !date && type !== "analyzed") {
            console.log(
                `[NewsController] No news found for today. Triggering fallback to latest news...`
            );
            news = await News.find({})
                .sort({ date: -1, createdAt: -1 })
                .limit(15);
            console.log(
                `[NewsController] Fallback returned ${news.length} items.`
            );
        }

        res.json(news);
    } catch (error) {
        console.error("[NewsController] Error in getNews:", error);
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
