import { Router } from "express";
import {
    createTranscription,
    getTranscriptionsByUser,
} from "../controllers/transcription.controller.js";

const router = Router();

router.post("/transcription", createTranscription);
router.get("/transcription/user/:userId", getTranscriptionsByUser);

export default router;
