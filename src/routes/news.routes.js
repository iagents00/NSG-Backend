import { Router } from "express";
import {
    getNews,
    createNews,
    analyzeNews,
} from "../controllers/news.controller.js";

const router = Router();

// Endpoint to get news (supports optional date filter)
router.get("/search", getNews);

// Endpoint to analyze news via n8n
router.post("/analyze/:id", analyzeNews);

// Complementary endpoint to create news (for testing usually)
router.post("/", createNews);

export default router;
