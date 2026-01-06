import { Router } from "express";
import {
    createTranscription,
    getTranscriptionsByUser,
    generateTranscriptionAnalysis,
    getTranscriptionAnalysis,
    updateTranscriptionCheckedSteps,
    deleteTranscription,
    saveAudioTranscript,
} from "../controllers/transcription.controller.js";

const router = Router();

router.post("/transcription", createTranscription);
router.get("/transcription/user/:userId", getTranscriptionsByUser);
router.delete("/transcription/:id", deleteTranscription);
router.post("/save-audio-transcript", saveAudioTranscript);

// Analysis routes
router.post("/generate-analysis", generateTranscriptionAnalysis);
router.get("/analysis/:transcription_id", getTranscriptionAnalysis);
router.put(
    "/analysis/:transcription_id/steps",
    updateTranscriptionCheckedSteps
);

export default router;
