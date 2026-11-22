import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeRtiText, validateRtiCharset, sanitizeFilename } from "../utils/sanitizer.js";
import { matchPublicRecords, evaluateClarification, generateDemoDraft, generateDemoAppeal } from "../services/demoService.js";
import { generatePdfBuffer } from "../utils/pdfGenerator.js";

test("Sanitizer - removes quotes, semicolons, exclamations and non-allowed chars", () => {
  const dirty = "Why was the road not paved? It's unacceptable! Budget: $500,000; Contractor: <ABC Ltd> & \"XYZ Corp\"!";
  const clean = sanitizeRtiText(dirty, 3000);

  assert.ok(!clean.includes('"'), "Must not contain double quotes");
  assert.ok(!clean.includes("'"), "Must not contain single quotes");
  assert.ok(!clean.includes(";"), "Must not contain semicolons");
  assert.ok(!clean.includes("!"), "Must not contain exclamation marks");
  assert.ok(!clean.includes("<"), "Must not contain angle brackets");
  assert.ok(!clean.includes(">"), "Must not contain angle brackets");
  assert.ok(!clean.includes("$"), "Must not contain dollar sign");

  const validation = validateRtiCharset(clean, 3000);
  assert.equal(validation.isValid, true, "Sanitized text must be valid for RTI Online charset");
});

test("Sanitizer - enforces <= 3000 characters limit without chopping words", () => {
  const longText = "Road inspection report certified copies needed. ".repeat(150); // ~7200 chars
  const sanitized = sanitizeRtiText(longText, 3000);

  assert.ok(sanitized.length <= 3000, "Length must be <= 3000 chars");
  const validation = validateRtiCharset(sanitized, 3000);
  assert.equal(validation.isWithinLimit, true);
});

test("Sanitizer - space-free filenames", () => {
  const dirtyName = "RTI Request Ward 12 Nalgonda 2026.pdf";
  const cleanName = sanitizeFilename(dirtyName, "pdf");

  assert.ok(!cleanName.includes(" "), "Filename must contain zero spaces");
  assert.equal(cleanName, "RTI_Request_Ward_12_Nalgonda_2026.pdf");
});

test("Public Records - Scenario A: BPL Fee Exemption (0-Day instant answer)", () => {
  const query = "Do I have to pay an RTI fee if I have a BPL card?";
  const result = matchPublicRecords(query, { state: "Telangana", district: "Nalgonda" });

  assert.equal(result.matched, true);
  assert.equal(result.record.id, "bpl_rti_fee_waiver");
  assert.ok(result.record.direct_answer.includes("Section 7(5)"));
  assert.ok(result.record.source_url.includes("rtionline.gov.in"));
});

test("Clarification Evaluator - Triggers on short or vague queries", () => {
  const shortQuery = "Need road file";
  const evalResult = evaluateClarification(shortQuery);

  assert.equal(evalResult.needsClarification, true);
  assert.ok(evalResult.questions.length >= 1);
});

test("Draft Engine - Scenario B: 48-Hour Urgent RTI (Hospital MRI)", () => {
  const query = "My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals.";
  const draft = generateDemoDraft(
    query,
    { state: "Telangana", district: "Nalgonda" },
    { name: "Ramesh Kumar", is_bpl: false }
  );

  assert.equal(draft.recommended_track, "URGENT_48HR");
  assert.ok(draft.portal_safe_text.includes("Section 7(1)"));
  assert.ok(draft.rejection_audit.within_3000_chars);
  assert.ok(draft.rejection_audit.portal_safe_charset);
});

test("Draft Engine - Scenario C: Municipal Road Work (State RTI)", () => {
  const query = "Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details.";
  const draft = generateDemoDraft(
    query,
    { state: "Telangana", district: "Nalgonda", ward: "Ward 12" },
    { name: "Ramesh Kumar", is_bpl: false }
  );

  assert.equal(draft.recommended_track, "STANDARD_RTI");
  assert.equal(draft.jurisdiction, "STATE");
  assert.ok(draft.jurisdiction_warning.includes("Do NOT file on rtionline.gov.in"));
  assert.ok(draft.reframed_questions.length >= 3);
  assert.ok(!draft.reframed_questions.some(q => q.toLowerCase().startsWith("why")));
});

test("First Appeal - Section 19(1) Deemed Refusal", () => {
  const appeal = generateDemoAppeal({
    caseId: "CASE-001",
    department_match: { name: "Nalgonda Municipal Corporation" },
    applicant: { name: "Ramesh Kumar" }
  });

  assert.ok(appeal.appeal_title.includes("Section 19(1)"));
  assert.ok(appeal.legal_grounds.includes("Section 7(2)"));
  assert.ok(appeal.legal_grounds.includes("Section 7(6)"));
  assert.ok(appeal.char_count <= 3000);
});

test("PDF Generation - Streams binary PDF buffer with valid header", async () => {
  const dummyDraft = {
    query: "Ward 12 road budget",
    recommended_track: "STANDARD_RTI",
    issueLocation: { state: "Telangana", district: "Nalgonda" },
    applicant: { name: "Ramesh Kumar", address: "H.No 4-2-11, Nalgonda" },
    department_match: { name: "Nalgonda Municipal Corporation", officer: "PIO" },
    reframed_questions: ["1. Certified copy of work order.", "2. Contractor details."]
  };

  const buffer = await generatePdfBuffer("RTI", dummyDraft);
  assert.ok(buffer instanceof Buffer);
  assert.ok(buffer.length > 1000, "PDF buffer must contain binary document bytes");
  // PDF magic header %PDF-
  assert.equal(buffer.toString("utf8", 0, 4), "%PDF");
});
