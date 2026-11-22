# CONTEXT.md — File-Level Architecture Registry

This registry maps every file in the JanSawaal repository to its responsibility, key exports, and line-level navigation anchors.

---

## Backend (`server/`)

### Core Entry & Configuration
- [`server/index.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/index.js#L1-L40)
  - **Role:** Express server initialization, middleware configuration (CORS, JSON 10MB, URL-encoded), API route mounting, health check endpoint (`GET /api/health`).
- [`server/package.json`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/package.json#L1-L18)
  - **Role:** Node.js ES Modules package definition with `express`, `cors`, `dotenv`, `multer`, `pdfkit`.

### Data Layer
- [`server/data/publicRecords.json`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/data/publicRecords.json#L1-L140)
  - **Role:** Curated Section 4(1)(b) proactive public disclosures (BPL RTI fee waivers, MGNREGA wages, PM-KISAN, property tax, NFSA ration quota, voter ID, water connection SLAs, PMAY).
- [`server/data/departments.json`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/data/departments.json#L1-L240)
  - **Role:** Directory of 30 Central Ministries (`rtionline.gov.in` / `pgportal.gov.in`) and 20 State/Municipal authorities with jurisdiction tags.

### Utilities & Services
- [`server/utils/sanitizer.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/utils/sanitizer.js#L1-L85)
  - **Role:** RTI Online portal text sanitizer (`sanitizeRtiText`), character set validator (`validateRtiCharset`), space-free PDF filename generator (`sanitizeFilename`).
- [`server/utils/pdfGenerator.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/utils/pdfGenerator.js#L1-L199)
  - **Role:** `PDFDocument` buffer streaming for Section 6(1) RTIs, Section 7(1) 48-Hour Urgent requests, Section 19(1) First Appeals, and CPGRAMS petitions with official JanSawaal footer.
- [`server/services/demoService.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/services/demoService.js#L1-L554)
  - **Role:** Deterministic zero-latency fallback engine for public record matching, clarification detection, dynamic 11-topic legal draft generation, and first appeals.
- [`server/services/groqService.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/services/groqService.js#L1-L90)
  - **Role:** Groq Whisper audio transcription (`whisper-large-v3-turbo`) and LLaMA legal reframing (`llama-3.3-70b-versatile`).
- [`server/services/geminiService.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/services/geminiService.js#L1-L45)
  - **Role:** Google Gemini API integration (`gemini-2.5-flash`) for multi-turn structured legal output.

### API Routes
- [`server/routes/transcribe.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/routes/transcribe.js#L1-L35)
  - **Role:** `POST /api/transcribe` — In-memory Multer buffer handler to Whisper STT.
- [`server/routes/records.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/routes/records.js#L1-L50)
  - **Role:** `POST /api/check-records` — Evaluates query against public records; returns `FOUND_IN_RECORDS`, `NEEDS_CLARIFICATION`, or `NEEDS_FILING`.
- [`server/routes/draft.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/routes/draft.js#L1-L55)
  - **Role:** `POST /api/draft-rti` — Legal speed routing, Section 6(1) reframing, and sanitizer enforcement.
- [`server/routes/appeal.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/routes/appeal.js#L1-L35)
  - **Role:** `POST /api/draft-appeal` — Section 19(1) First Appeal memorandum generation.
- [`server/routes/pdf.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/server/routes/pdf.js#L1-L40)
  - **Role:** `POST /api/generate-pdf` — Streams binary PDF with space-free filename header.

---

## Frontend (`client/`)

### Application Core & Routing
- [`client/src/main.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/main.jsx#L1-L15)
  - **Role:** React 18 DOM mount with `<BrowserRouter>` root for full browser history support.
- [`client/src/App.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/App.jsx#L1-L315)
  - **Role:** Master router (`Routes`, `Route`, `useNavigate`, `useLocation`) navigating between `/`, `/intake`, `/direct-answer`, `/draft`, and `/cases` with browser Back/Forward integration.
- [`client/src/index.css`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/index.css#L1-L30)
  - **Role:** Tailwind CSS directives and high-contrast accessibility rules.

### Components
- [`client/src/components/Header.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/Header.jsx#L1-L95)
  - **Role:** Civic brand header, browser-history navigation links, language selector (`EN`, `తెలుగు`, `हिन्दी`), demo controls toggle.
- [`client/src/components/WelcomeScreen.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/WelcomeScreen.jsx#L1-L90)
  - **Role:** Step 1 landing screen (`/`), voice greeting button, and AI RTI Guardrails strip.
- [`client/src/components/QueryIntakeForm.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/QueryIntakeForm.jsx#L1-L260)
  - **Role:** Step 2 form (`/intake`): Upfront Issue Location selector + Long Query Box with pause-proof Voice-to-Type microphone and language switcher (`English`, `తెలుగు`, `हिन्दी`).
- [`client/src/components/VoiceClarification.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/VoiceClarification.jsx#L1-L95)
  - **Role:** Step 3: Smart 1-2 voice clarifying questions dialog with TTS speech.
- [`client/src/components/DirectAnswerCard.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/DirectAnswerCard.jsx#L1-L115)
  - **Role:** Step 4 (Path A: `/direct-answer`): Instant 0-Day public record disclosure card with voice readback and source links.
- [`client/src/components/ApplicantDetailsModal.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/ApplicantDetailsModal.jsx#L1-L165)
  - **Role:** Step 5 (Path B): Applicant personal details modal (Name, postal address, BPL toggle).
- [`client/src/components/DraftAndGuideView.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/DraftAndGuideView.jsx#L1-L245)
  - **Role:** Step 6 (`/draft`): Speed track badge, Central vs State warning, rejection audit checklist, 3,000-char portal-safe copy box, and PDF download button.
- [`client/src/components/PortalFilingGuide.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/PortalFilingGuide.jsx#L1-L80)
  - **Role:** Step 6 walkthrough: Numbered steps for Central `rtionline.gov.in` vs State Municipal filing.
- [`client/src/components/TrackerDashboard.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/TrackerDashboard.jsx#L1-L245)
  - **Role:** Step 7 (`/cases`): Live SLA countdown tracker, Section 7(6) free copy alert, and "Simulate SLA Breach" 1-click First Appeal generator.
- [`client/src/components/DemoControlDrawer.jsx`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/components/DemoControlDrawer.jsx#L1-L90)
  - **Role:** Header drawer with 1-click scenario runners for Scenarios A, B, and C with full route navigation.

### Frontend Utilities & Data
- [`client/src/utils/api.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/utils/api.js#L1-L75)
  - **Role:** Fetch client for all backend endpoints.
- [`client/src/utils/tts.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/utils/tts.js#L1-L95)
  - **Role:** Human-Feel Neural TTS Engine with asynchronous voice pre-loading, natural ranking, and Indian English, Telugu, and Hindi human voice prioritization.
- [`client/src/utils/speechRecognition.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/utils/speechRecognition.js#L1-L120)
  - **Role:** Pause-Proof Multilingual Speech Recognizer (`createPauseProofRecognizer`) that prevents wiping sentences across pauses and supports English (`en-IN`), Telugu (`te-IN`), and Hindi (`hi-IN`).
- [`client/src/utils/sanitizer.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/utils/sanitizer.js#L1-L55)
  - **Role:** Client-side copy-box validator and space-free filename sanitizer.
- [`client/src/data/locations.js`](file:///c:/Users/nikhi/Downloads/IdeaForge2/client/src/data/locations.js#L1-L60)
  - **Role:** Indian States, Districts, and Wards lookup table.
