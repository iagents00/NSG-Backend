import Strategy from "../models/strategy.model.js";

export const get_user_strategies = async (req, res) => {
    try {
        const id = req.user.id;
        const strategies = await Strategy.find({ user_id: id.toString() });
        console.log(`>>> USER: ${id} | COUNT: ${strategies.length}`);
        res.json(strategies);
    } catch (error) {
        console.error(">>> ERR:", error.message);
        res.status(500).json({ message: error.message });
    }
};
