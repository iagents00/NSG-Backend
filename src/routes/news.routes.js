import { Router } from "express";
import { getNewsByDate, createNews } from "../controllers/news.controller.js";

const router = Router();

// Endpoint to get news by date
// Example: GET /news/search?date=2023-12-31
router.get("/search", getNewsByDate);

// Complementary endpoint to create news (for testing usually)
router.post("/", createNews);

export default router;
