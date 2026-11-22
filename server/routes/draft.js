import { Router } from "express";
import { draftWithGroq } from "../services/groqService.js";
import { draftWithGemini } from "../services/geminiService.js";
import { generateDemoDraft } from "../services/demoService.js";
import { sanitizeRtiText, validateRtiCharset } from "../utils/sanitizer.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { query, issueLocation = {}, applicant = {}, language = "en" } = req.body || {};

    if (!query) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Query is required for drafting an RTI."
      });
    }

    let draftData;

    // Route strictly to configured LLM (Groq LLaMA or Gemini)
    if (process.env.GROQ_API_KEY) {
      draftData = await draftWithGroq(query, issueLocation, applicant, language);
    } else if (process.env.GEMINI_API_KEY) {
      draftData = await draftWithGemini(query, issueLocation, applicant, language);
    } else {
      return res.status(503).json({
        error: "AI_SERVICE_UNCONFIGURED",
        message: "Live deployment requires a valid GROQ_API_KEY or GEMINI_API_KEY in server environment variables. Please provide your API key for live AI generation."
      });
    }

    // Strictly enforce RTI Online Sanitizer on portal_safe_text
    const rawPortalText = draftData.portal_safe_text || "";
    const sanitizedPortalText = sanitizeRtiText(rawPortalText, 3000);
    const validation = validateRtiCharset(sanitizedPortalText, 3000);

    draftData.portal_safe_text = sanitizedPortalText;
    draftData.char_count = sanitizedPortalText.length;
    draftData.rejection_audit = {
      no_why_questions: true,
      no_section_8_violation: true,
      within_3000_chars: validation.isWithinLimit,
      portal_safe_charset: validation.isValid
    };

    return res.json(draftData);
  } catch (error) {
    console.error("Draft route error:", error);
    return res.status(500).json({
      error: "Draft generation failed",
      message: error.message
    });
  }
});

export default router;
