import { Router } from "express";
import { matchPublicRecords, evaluateClarification } from "../services/demoService.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { query, issueLocation = {}, language = "en" } = req.body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "A non-empty query string is required."
      });
    }

    // 1. Check if the query matches curated public records (0-Day instant answer)
    const publicMatch = matchPublicRecords(query, issueLocation);
    if (publicMatch.matched && publicMatch.record) {
      return res.json({
        status: "FOUND_IN_RECORDS",
        direct_answer: publicMatch.record.direct_answer,
        source_name: publicMatch.record.source_name,
        source_url: publicMatch.record.source_url,
        voice_summary: publicMatch.record.voice_summary,
        section_reference: publicMatch.record.section_reference
      });
    }

    // 2. Check if the query lacks essential context and needs clarification
    const clarification = evaluateClarification(query);
    if (clarification.needsClarification) {
      return res.json({
        status: "NEEDS_CLARIFICATION",
        clarifying_questions: clarification.questions,
        reason: clarification.reason
      });
    }

    // 3. Information is not in public records -> Proceed to RTI / Fast-track filing
    return res.json({
      status: "NEEDS_FILING",
      clarifying_questions: [],
      reason: "Specific local records, contractor work orders, or medical files are not publicly disclosed online. An official RTI / Fast-Track draft is required."
    });
  } catch (error) {
    console.error("Check-records route error:", error);
    return res.status(500).json({
      error: "Public record check failed",
      message: error.message
    });
  }
});

export default router;
