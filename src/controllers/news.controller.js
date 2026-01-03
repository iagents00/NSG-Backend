import News from "../models/news.model.js";

export const getNewsByDate = async (req, res) => {
    try {
        const { date } = req.query; // Expecting YYYY-MM-DD or a timestamp

        if (!date) {
            return res.status(400).json({ message: "La fecha es requerida" });
        }

        // Parse date to start and end of day
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({ message: "Formato de fecha inválido" });
        }

        const news = await News.find({
            $or: [
                {
                    published_at: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                },
                {
                    date: date // Match exact string like "2025-12-31"
                }
            ]
        });

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
