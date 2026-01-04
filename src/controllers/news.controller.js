import News from "../models/news.model.js";

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
