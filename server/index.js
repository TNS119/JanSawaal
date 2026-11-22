import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import transcribeRouter from "./routes/transcribe.js";
import recordsRouter from "./routes/records.js";
import draftRouter from "./routes/draft.js";
import appealRouter from "./routes/appeal.js";
import pdfRouter from "./routes/pdf.js";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route Mounts
app.use("/api/transcribe", transcribeRouter);
app.use("/api/check-records", recordsRouter);
app.use("/api/draft-rti", draftRouter);
app.use("/api/draft-appeal", appealRouter);
app.use("/api/generate-pdf", pdfRouter);

// Health Check
app.get("/api/health", (req, res) => {
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    app: "JanSawaal (Voice-First & Fast-Track RTI Engine)",
    ai_status: hasGroq ? "GROQ_LLAMA_ACTIVE" : hasGemini ? "GEMINI_ACTIVE" : "MISSING_API_KEYS",
    live_deployment: true,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production / Render deployment
const clientDistPath = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  const indexPath = path.resolve(clientDistPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send("JanSawaal API is active. Build frontend via 'npm run build' to see the UI.");
    }
  });
});

export default app;

app.listen(PORT, () => {
  console.log(`[JanSawaal Server] Running on http://localhost:${PORT}`);
  console.log(`[JanSawaal Server] Live Deployment Mode: Strictly Real API (Groq: ${Boolean(process.env.GROQ_API_KEY)}, Gemini: ${Boolean(process.env.GEMINI_API_KEY)})`);
});
