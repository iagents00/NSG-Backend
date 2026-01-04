import News from "../models/news.model.js";
import axios from "axios";

export const getNews = async (req, res) => {
    try {
        const { date } = req.query;

        let query = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);

            if (!isNaN(startOfDay.getTime())) {
                query = {
                    $or: [
                        {
                            published_at: {
                                $gte: startOfDay,
                                $lte: endOfDay,
                            },
                        },
                        {
                            date: date,
                        },
                    ],
                };
            }
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

        if (!id) {
            return res
                .status(400)
                .json({ message: "El ID de la noticia es requerido" });
        }

        // Forwarding to n8n webhook
        const n8nWebhookUrl =
            "https://personal-n8n.suwsiw.easypanel.host/webhook/analyze-news";

        const response = await axios.post(n8nWebhookUrl, { id });

        // Extract analysis text from n8n response
        const analysisText =
            typeof response.data === "string"
                ? response.data
                : response.data.analysis || JSON.stringify(response.data);

        // Save analysis result to database
        await News.findByIdAndUpdate(id, { analysis: analysisText });

        // Return the analysis JSON/string to the frontend
        res.json(response.data);
    } catch (error) {
        console.error("Error calling n8n:", error.message);
        res.status(500).json({
            message: "Error al procesar el análisis estratégico",
            error: error.message,
        });
    }
};
