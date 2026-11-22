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

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: "STT_SERVICE_UNCONFIGURED",
        message: "Server-side Whisper transcription requires a valid GROQ_API_KEY in server environment variables. (Browser Web Speech recognition remains active directly on the client)."
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: "INVALID_AUDIO_PAYLOAD",
        message: "A valid audio file buffer is required for speech-to-text processing."
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
