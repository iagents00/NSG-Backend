import Strategy from "../models/strategy.model.js";

export const get_user_strategies = async (req, res) => {
    try {
        const idFromToken = req.user.id;
        const idFromFrontend = req.query.userId;

        console.log("════════════ DEBUG ESTRATEGIAS ════════════");
        console.log("🆔 ID DEL TOKEN (Backend):", idFromToken);
        console.log("🆔 ID DEL FRONTEND (Query):", idFromFrontend);
        console.log("═══════════════════════════════════════════");

        const strategies = await Strategy.find({ user_id: idFromToken.toString() });
        console.log(`📊 Encontrados: ${strategies.length}`);

        res.json(strategies);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
