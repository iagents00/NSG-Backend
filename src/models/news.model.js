import mongoose from "mongoose";

const news_schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        tag: {
            type: String,
            default: "General",
        },
        source: {
            type: String,
            default: "NSG Intelligence",
        },
        color: {
            type: String,
            default: "blue",
        },
        published_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: "news",
    }
);

export default mongoose.model("News", news_schema);
