import { Router } from "express";
import { getNews, createNews } from "../controllers/news.controller.js";

const router = Router();

// Endpoint to get news (supports optional date filter)
// Example: GET /news/search or GET /news/search?date=2023-12-31
router.get("/search", getNews);

// Complementary endpoint to create news (for testing usually)
router.post("/", createNews);

export default router;
