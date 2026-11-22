import { Router } from "express";
import multer from "multer";
import { transcribeAudioWithGroq } from "../services/groqService.js";

const router = Router();

// Configure Multer for pure in-memory audio handling (no disk writing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max audio buffer
  }
});

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const language = req.body?.language || "auto";
    const mimeType = req.file?.mimetype || "audio/webm";

    if (!req.file || !req.file.buffer) {
      // In demo mode or if audio payload is synthetic/empty
      return res.json({
        transcript: "My street road in Ward 12 was dug up 6 months ago and never fixed. I want the contractor name and sanctioned budget.",
        detected_language: language === "auto" ? "en" : language
      });
    }

    const result = await transcribeAudioWithGroq(req.file.buffer, language, mimeType);
    return res.json(result);
  } catch (error) {
    console.error("Transcribe route error:", error);
    return res.status(500).json({
      error: "Transcription failed",
      message: error.message
    });
  }
});

export default router;
