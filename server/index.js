import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import transcribeRouter from "./routes/transcribe.js";
import recordsRouter from "./routes/records.js";
import draftRouter from "./routes/draft.js";
import appealRouter from "./routes/appeal.js";
import pdfRouter from "./routes/pdf.js";

dotenv.config();

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
  res.json({
    status: "ok",
    app: "JanSawaal (Voice-First & Fast-Track RTI Engine)",
    demo_mode: process.env.DEMO_MODE === "true" || (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[JanSawaal Server] Running on http://localhost:${PORT}`);
  console.log(`[JanSawaal Server] Mode: ${process.env.DEMO_MODE === "true" ? "DEMO_MODE (Offline/Deterministic)" : "LIVE API"}`);
});
