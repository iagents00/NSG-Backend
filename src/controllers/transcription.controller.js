import Transcription from "../models/transcription.model.js";

export const createTranscription = async (req, res) => {
    try {
        const { userId, content } = req.body;

        if (!userId || !content) {
            return res
                .status(400)
                .json({ message: "User ID and content are required." });
        }

        const newTranscription = new Transcription({
            user_id: userId,
            content: content,
        });

        const savedTranscription = await newTranscription.save();

        res.status(201).json(savedTranscription);
    } catch (error) {
        console.error("Error creating transcription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTranscriptionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const transcriptions = await Transcription.find({
            user_id: userId,
        }).sort({
            createdAt: -1,
        });
        res.json(transcriptions);
    } catch (error) {
        console.error("Error fetching transcriptions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
