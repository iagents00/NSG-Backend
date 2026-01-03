import Strategy from "../models/strategy.model.js";

export const get_user_strategies = async (req, res) => {
    try {
        console.log("🔍 Consultando estrategias para user_id:", req.user.id);
        const strategies = await Strategy.find({ user_id: req.user.id });
        console.log(`✅ Se encontraron ${strategies.length} estrategias.`);
        res.json(strategies);
    } catch (error) {
        console.error("❌ Error en get_user_strategies:", error.message);
        res.status(500).json({ message: error.message });
    }
};
