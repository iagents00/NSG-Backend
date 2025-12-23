import mongoose from "mongoose";

const telegram_user_schema = new mongoose.Schema(
    {
        telegram_id: {
            type: Number,
            required: true,
            unique: true,
        },
        // We can add more fields if needed later, but for now this is the requirement.
        chat_id: {
            type: Number,
        },
        username: {
            type: String,
        },
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
    },
    {
        timestamps: true,
        collection: "telegram_users", // Explicitly setting the collection name
    }
);

export default mongoose.model("TelegramUser", telegram_user_schema);
