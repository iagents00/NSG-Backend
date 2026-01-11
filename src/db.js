import mongoose from "mongoose";

/**
 * Función para conectar a la base de datos MongoDB.
 */

export const connect_db = async () => {
    try {
        const uri =
            "mongodb+srv://iagentsnsg_db_user:Nc0lLH0zK6LEFJQP@cluster0.pgbmwuy.mongodb.net/Database?appName=Cluster0";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
};
