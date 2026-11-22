import { Router } from "express";
import { generateDemoAppeal } from "../services/demoService.js";
import { sanitizeRtiText, validateRtiCharset } from "../utils/sanitizer.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body || {};
    const appeal = generateDemoAppeal(data);

    // Enforce sanitizer on appeal text
    appeal.portal_safe_text = sanitizeRtiText(appeal.portal_safe_text, 3000);
    appeal.char_count = appeal.portal_safe_text.length;
    appeal.rejection_audit = {
      no_why_questions: true,
      no_section_8_violation: true,
      within_3000_chars: appeal.char_count <= 3000,
      portal_safe_charset: validateRtiCharset(appeal.portal_safe_text).isValid
    };

    return res.json(appeal);
  } catch (error) {
    console.error("Appeal route error:", error);
    return res.status(500).json({
      error: "First Appeal generation failed",
      message: error.message
    });
  }
});

export default router;
