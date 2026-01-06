import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Transcription",
    transcriptionSchema,
    "user_transcriptions"
);
