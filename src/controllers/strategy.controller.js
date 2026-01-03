import Strategy from "../models/strategy.model.js";

export const get_user_strategies = async (req, res) => {
    try {
        // req.user.id viene del middleware auth_required
        const strategies = await Strategy.find({ user_id: req.user.id });
        res.json(strategies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
