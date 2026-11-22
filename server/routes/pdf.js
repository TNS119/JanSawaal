import { Router } from "express";
import { generatePdfBuffer } from "../utils/pdfGenerator.js";
import { sanitizeFilename } from "../utils/sanitizer.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { type = "RTI", draftData = {} } = req.body || {};

    const pdfBuffer = await generatePdfBuffer(type, draftData);

    // Build strict space-free filename
    const district = draftData.issueLocation?.district || "Local";
    const ward = draftData.issueLocation?.ward ? `_${draftData.issueLocation.ward}` : "";
    const track = draftData.recommended_track || type;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    let baseName = `RTI_${track}_${district}${ward}_${dateStr}`;
    if (type === "FIRST_APPEAL") {
      baseName = `FirstAppeal_Section19_1_${district}_${dateStr}`;
    }

    const filename = sanitizeFilename(baseName, "pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    return res.status(500).json({
      error: "PDF generation failed",
      message: error.message
    });
  }
});

export default router;
