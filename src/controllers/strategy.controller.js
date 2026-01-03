import Strategy from "../models/strategy.model.js";

export const get_user_strategies = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        console.log("🔍 Consultando estrategias para user_id (string):", userId);

        const strategies = await Strategy.find({ user_id: userId });

        console.log(`✅ Se encontraron ${strategies.length} estrategias para ${userId}`);
        res.json(strategies);
    } catch (error) {
        console.error("❌ Error en get_user_strategies:", error.message);
        res.status(500).json({ message: error.message });
    }
};
