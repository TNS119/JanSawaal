# Project Specification: RTI-Draft (Voice-First & Fast-Track Edition)

## 1. Executive Summary

**RTI-Draft** is a voice-first civic-tech web application that helps Indian citizens get **fast government clarity and action** in their regional language (English, Telugu, Hindi, or code-switched speech).

Instead of forcing every citizen through complicated forms and a 30-day wait, the application follows a smart, **record-first workflow**:

1. **Checks Public Records First (0-Day Instant Answer):** Uses the citizen's query and **Issue Location** to check if the requested information is already available in public disclosures (Section 4(1)(b)), welfare portals, or municipal dashboards. If found, it delivers the **direct answer immediately** without asking for personal details.
2. **Generates Rejection-Proof RTI / Fast-Track Drafts:** If the information is *not* in public records, it collects the applicant's personal details, selects the fastest legal track (**48-Hour Section 7(1) Urgent RTI**, **3-Day CPGRAMS Priority Grievance**, or **Standard Section 6(1) RTI**), generates a ready-to-use **RTI PDF & Portal-Safe Text**, and provides a **Step-by-Step RTI Website Filing Guide**.

---

## 2. Core User Workflow (End-to-End UX)

### Step 1: Welcome Screen & AI Guardrails
* When the application opens, it displays a clean, accessible welcome screen with a prominent **"Register a Problem / Start Conversation"** button (ensuring smooth browser audio playback without autoplay blocks).
* Displays a concise, visual **AI RTI Guardrails Strip** right below the button:
  * *Checks existing public records first for instant answers.*
  * *Never upload Aadhaar or PAN cards (only BPL card if claiming a fee waiver).*
  * *Automatically converts questions into legal Section 6(1) record requests.*

### Step 2: Voice Greeting & Quick Intake
* Clicking **"Register a Problem"** triggers a brief, warm voice greeting via TTS (*"Hello! Tell me what government information or issue you need help with, and where the issue is located."*).
* The interface presents **two clearly separated inputs**:
  1. **Issue Location Selector (Upfront):** State, District/City, and optional Ward/Locality (required to accurately search public records and identify the right department).
  2. **Long Query Input Box (Type + Voice-to-Type):** A spacious, editable text area where the user can either **type** their full issue or tap an embedded **"Voice-to-Type" microphone button** to speak naturally in English, Telugu, or Hindi and watch their words appear live for review/editing.

### Step 3: Voice Follow-Up (Only If Needed)
* If a critical routing detail is missing from the query (e.g., whether a road work is *ongoing/completed* or *never started*, or if there is a *life/safety emergency*), the AI asks **1–2 brief voice + text clarifying questions** before proceeding.

### Step 4: Instant Public Record Check (Decision Gate)
The backend evaluates the **Query + Issue Location** against curated public records (`publicRecords.json`) and Section 4 disclosures:
* **Path A — Found in Public Records (Direct Answer):**
  * Immediately displays a verified **Direct Answer Card** with the official source link and a **Voice Readback** button.
  * No personal details needed, no RTI filing required. (Includes a secondary *"Still need official certified copies? Draft an RTI"* button just in case.)
* **Path B — Not Found in Public Records (Proceed to RTI / Fast-Track Draft):**
  * Explains in plain language that the specific record is not publicly listed online and smoothly opens **Step 5**.

### Step 5: Applicant Personal Details (Only When Filing Is Needed)
* Kept strictly separate from the query box. Collects only what is legally required for the RTI form/PDF:
  * Full Legal Name
  * Home Postal Address & PIN Code
  * Phone / Email (optional)
  * **BPL Card Holder Toggle** (sets fee to Rs. 0 if enabled)

### Step 6: RTI-Ready Output, PDF & Website Filing Guide
* **Fast-Track Speed Badge:** Highlights the fastest legal route:
  * **48-Hour Emergency RTI** (Section 7(1) Life & Liberty)
  * **Fast-Track CPGRAMS Grievance** (48-hr officer assignment / 3-day priority for civic repairs)
  * **Standard RTI** (Ongoing or completed works under Section 2(f) & 2(j))
* **Central vs. State Warning:** Explicitly alerts the user if it is a **State/Municipal** matter so they do not waste money filing on `rtionline.gov.in`.
* **Portal-Safe Copy Box & PDF Download:** Outputs text sanitized to $\le 3,000$ characters (RTI Online allowed charset only) plus a formatted **Download RTI PDF** button (zero spaces in filename).
* **Interactive RTI Website Filing Guide:** A clean, numbered step-by-step walkthrough showing the user exactly which portal to open, which Ministry/Department dropdown to pick, where to paste the text, how to pay Rs. 10 (or attach BPL proof), and how to save their registration number.

### Step 7: My Cases (Live SLA Tracker & Free First Appeal)
* Users can save any generated draft to **"My Cases"** with a dynamic countdown (**48 Hours**, **3 Days**, or **30 Days**) and a Section 7(6) free-copy reminder.
* Includes a **"Simulate SLA Breach (No Reply)"** demo button that flips the status to `OVERDUE` and generates a free **Section 19(1) First Appeal PDF**.

---

## 3. Target Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS + Lucide Icons | High-contrast, accessible, voice-first SPA with large touch targets (min `48px`). |
| **Backend** | Node.js (Express) + `multer` (memory storage) | REST API handling transcription, public-record lookup, LLM legal routing, sanitization, and PDF generation. |
| **Speech-to-Text (STT)** | Groq API (`whisper-large-v3-turbo`) + Web Speech API fallback | Fast multilingual Voice-to-Type supporting Indian accents and code-switching. |
| **LLM Legal Engine** | Groq API (`llama-3.3-70b-versatile`) or Gemini API (`gemini-2.5-flash`) | Strict JSON extraction, public-record matching, Fast-Track Speed Routing, and Section 6(1)/7(1) reframing. |
| **Text-to-Speech (TTS)** | Browser `window.speechSynthesis` | Voice greetings, clarifying questions, and direct-answer / draft readback in English, Telugu, or Hindi. |
| **PDF Generation** | `pdfkit` (Backend) | Generates formal RTI, 48-Hr Urgent RTI, CPGRAMS, and Section 19(1) First Appeal PDFs (no spaces in filenames). |
| **Data & State** | `publicRecords.json` + `departments.json` + `localStorage` | Curated public-record knowledge base, 30 Central + 20 State/Municipal authorities, and local case tracker. |

---

## 4. Step-by-Step Build Instructions

Follow this exact sequence to build and verify the MVP cleanly:

1. **Step 1 — Workspace & Environment Setup:**
   * Initialize `client/` (React + Vite + Tailwind CSS) and `server/` (Node.js + Express).
   * Create `.env.example` with `GROQ_API_KEY`, `GEMINI_API_KEY`, `PORT=5000`, and `DEMO_MODE=true`.

2. **Step 2 — Create Data Layer (`server/data/`):**
   * `publicRecords.json`: Curated public-record entries (e.g., Telangana/National welfare scheme rules, MGNREGA wage/work lookup links, municipal property tax & tender portals, PM-KISAN status rules, RTI fee & BPL exemptions) so Path A ("Already in Records") works reliably.
   * `departments.json`: 30 top Central Ministries (`rtionline.gov.in` / `pgportal.gov.in`) and 20 common State/Municipal departments (Municipal Corporation, Water Board, Electricity, Health, Police, Revenue).

3. **Step 3 — Build Sanitizer & Legal Prompts (`server/prompts/` & `server/utils/`):**
   * `recordCheck.js`: Evaluates `query + issueLocation` against `publicRecords.json` to decide `FOUND_IN_RECORDS` vs. `NEEDS_FILING` (plus up to 2 clarifying questions if critical context is missing).
   * `rtiReframer.js`: Encodes the Fast-Track Speed Router (48-Hr Urgent RTI, 3-Day CPGRAMS Priority, Standard RTI), Central vs. State routing, Section 6(1) record reframing, and Section 8 checks.
   * `firstAppeal.js`: Generates Section 19(1) First Appeal / CPGRAMS escalation text.
   * `sanitizer.js`: Enforces the $\le 3,000$-character limit and allowed RTI Online regex (`[^A-Za-z0-9,.\-_()/@:&?\\%\s]`).

4. **Step 4 — Implement Backend Routes (`server/routes/`):**
   * `POST /api/transcribe`: In-memory `multer` upload $\rightarrow$ Groq Whisper $\rightarrow$ `{ transcript, detected_language }`.
   * `POST /api/check-records`: Checks `query + issueLocation` $\rightarrow$ returns either `DIRECT_ANSWER`, `NEEDS_CLARIFICATION`, or `PROCEED_TO_FILING`.
   * `POST /api/draft-rti`: Takes `query + issueLocation + applicantDetails` $\rightarrow$ returns sanitized Speed-Routed RTI/Grievance JSON + step-by-step website guide.
   * `POST /api/draft-appeal`: Generates free Section 19(1) First Appeal / Escalation JSON.
   * `POST /api/generate-pdf`: Streams a clean `application/pdf` with no spaces in the filename.

5. **Step 5 — Build Frontend Screens (`client/src/components/`):**
   * `WelcomeScreen.jsx`: Greeting + **"Register a Problem"** button + visual AI RTI Guardrails strip.
   * `QueryIntakeForm.jsx`: Upfront **Issue Location** selector + **Long Query Box** with integrated **Voice-to-Type** mic button & language selector.
   * `DirectAnswerCard.jsx`: Instant answer display with official source link, voice readback, and optional "Still file an RTI" button.
   * `ApplicantDetailsModal.jsx`: Separate form for Name, Postal Address, and BPL toggle (shown only when filing is needed).
   * `DraftAndGuideView.jsx`: Speed Track Badge, Rejection Audit Checklist, 3,000-char Portal-Safe Copy Box, Download PDF button, and `PortalFilingGuide.jsx` (numbered walkthrough for the RTI website).
   * `TrackerDashboard.jsx` & `DemoControlDrawer.jsx`: Live SLA tracker + 1-click demo scenarios.

6. **Step 6 — End-to-End Verification:**
   * Verify **Scenario 1 (Direct Answer)** skips personal details and gives an instant answer.
   * Verify **Scenario 2 (48-Hr Urgent RTI)** and **Scenario 3 (Standard RTI / CPGRAMS)** collect applicant details, sanitize output to $\le 3,000$ chars, download a no-space PDF, and display the website filing guide.
   * Verify `DEMO_MODE=true` runs smoothly without live API keys.

---

## 5. API Contracts

### `POST /api/transcribe`
* **Request:** `multipart/form-data` (`audio`: Blob, `language`: `"auto" | "en" | "te" | "hi"`)
* **Response:** `{ "transcript": "...", "detected_language": "en" }`

### `POST /api/check-records`
* **Request:**
```json
{
  "query": "What is the official fee for filing a Central RTI if I have a BPL card?",
  "issueLocation": { "state": "Telangana", "district": "Nalgonda", "ward": "" },
  "language": "en"
}
```
* **Response (Path A — Found in Public Records):**
```json
{
  "status": "FOUND_IN_RECORDS",
  "direct_answer": "Under Section 7(5) of the RTI Act, 2005, applicants holding a Below Poverty Line (BPL) card are completely exempt from paying the Rs. 10 application fee and document copy charges. You only need to attach a copy of your valid BPL certificate (PDF under 1 MB).",
  "source_name": "RTI Online Official FAQ (DoPT, Govt of India)",
  "source_url": "https://rtionline.gov.in/guidelines.php",
  "voice_summary": "Good news! With a valid BPL card, your RTI fee is zero rupees. You do not need to file a separate RTI to check this."
}
```
* **Response (Path B — Not Found / Needs Filing):**
```json
{
  "status": "NEEDS_FILING",
  "clarifying_questions": [],
  "reason": "Specific ward-level road repair bills and contractor work orders are not publicly listed online. Let us prepare an official RTI / Fast-Track request for you."
}
```

### `POST /api/draft-rti`
* **Request:**
```json
{
  "query": "My street road in Ward 12 was dug up 6 months ago and never fixed. I want the contractor name and sanctioned budget.",
  "issueLocation": { "state": "Telangana", "district": "Nalgonda", "ward": "Ward 12" },
  "applicant": { "name": "Ramesh Kumar", "address": "H.No 4-2-11, Nalgonda, 508001", "is_bpl": false },
  "language": "en"
}
```
* **Response:**
```json
{
  "recommended_track": "STANDARD_RTI",
  "estimated_response_time": "Up to 30 Days (or CPGRAMS Fast-Track for Repair Action)",
  "jurisdiction": "STATE",
  "jurisdiction_warning": "This is a Municipal/State matter. Do NOT file on rtionline.gov.in; submit via the Telangana State RTI portal or Speed Post to the Municipal Commissioner (PIO).",
  "department_match": {
    "name": "Nalgonda Municipal Corporation (Engineering Wing)",
    "officer": "Public Information Officer (Municipal Commissioner)",
    "portal_url": "https://rti.telangana.gov.in"
  },
  "reframed_questions": [
    "1. Provide a certified copy of the work order and budget sanctioned for road repair in Ward 12, Nalgonda for FY 2025-26.",
    "2. Provide the name of the assigned contractor and scheduled completion date on record.",
    "3. Provide the current status and latest site inspection report for the pending work."
  ],
  "portal_safe_text": "Subject: Application under Section 6(1) of the RTI Act, 2005...",
  "char_count": 486,
  "fee_calculation": { "amount_inr": 10, "note": "Standard State RTI fee via Portal / Indian Postal Order." },
  "filing_guide_steps": [
    "1. Open the Telangana State RTI Portal (or prepare Speed Post to the Municipal Commissioner, Nalgonda).",
    "2. Select Department: Municipal Administration & Urban Development.",
    "3. Paste the sanitized text from the box above into the 'Text for RTI Request' field.",
    "4. Pay the Rs. 10 fee (or upload your BPL certificate PDF under 1 MB with no spaces in the filename).",
    "5. Save the Registration Number and click 'Save to My Cases' below to track your deadline."
  ],
  "rejection_audit": {
    "no_why_questions": true,
    "no_section_8_violation": true,
    "within_3000_chars": true,
    "portal_safe_charset": true
  },
  "native_summary": "Your RTI draft for Ward 12 road work records is ready. Because this is a municipal matter, submit it to the Telangana Municipal office, not the Central portal."
}
```

---

## 6. Folder Structure

```text
rti-draft/
├── rti_draft_spec.md
├── .env.example
├── README.md
├── client/                         # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx       # Greeting + Register button + AI Guardrails
│   │   │   ├── QueryIntakeForm.jsx     # Issue Location + Long Box w/ Voice-to-Type
│   │   │   ├── DirectAnswerCard.jsx    # Path A: Instant answer from public records
│   │   │   ├── ApplicantDetailsModal.jsx # Path B: Personal info (only if filing)
│   │   │   ├── DraftAndGuideView.jsx   # Speed badge, audit, copy box, PDF download
│   │   │   ├── PortalFilingGuide.jsx   # Step-by-step RTI website walkthrough
│   │   │   ├── TrackerDashboard.jsx    # My Cases + Simulate SLA Breach
│   │   │   └── DemoControlDrawer.jsx   # 3 one-click demo scenarios
│   │   ├── utils/
│   │   │   ├── sanitizer.js
│   │   │   └── tts.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── server/                         # Node.js + Express
    ├── data/
    │   ├── publicRecords.json      # Curated public disclosures for Path A
    │   └── departments.json        # 30 Central + 20 State/Municipal authorities
    ├── prompts/
    │   ├── recordCheck.js
    │   ├── rtiReframer.js
    │   └── firstAppeal.js
    ├── routes/
    │   ├── transcribe.js
    │   ├── records.js              # POST /api/check-records
    │   ├── draft.js                # POST /api/draft-rti & /api/draft-appeal
    │   └── pdf.js                  # POST /api/generate-pdf
    ├── utils/
    │   └── sanitizer.js
    ├── index.js
    └── package.json
```

---

## 7. Stage-Ready Demo Control Panel
Include a collapsible **"Demo Controls"** drawer in the header with 3 one-click judge scenarios:
1. **Scenario A (Direct Answer — 0 Days):** *"Do I have to pay an RTI fee if I have a BPL card?"* $\rightarrow$ Instantly triggers **Path A** (direct verified answer, no personal form shown).
2. **Scenario B (48-Hr Urgent RTI):** *"My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals."* $\rightarrow$ Triggers **Path B** $\rightarrow$ 48-Hour Section 7(1) Urgent RTI PDF + Hospital PIO guide.
3. **Scenario C (Local Work Records + SLA Escalation):** *"Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details."* $\rightarrow$ Generates rejection-proof State RTI PDF + Website Filing Guide $\rightarrow$ Save to **My Cases** $\rightarrow$ Click **"Simulate SLA Breach"** to generate a free Section 19(1) First Appeal PDF.

---

## 8. Acceptance Criteria (Definition of Done)
1. App opens with a clean greeting screen, AI RTI Guardrails strip, and **"Register a Problem"** button that activates voice guidance cleanly.
2. User selects **Issue Location** separately from the **Long Query Input Box**, and can either type or use **Voice-to-Type** inside the box.
3. Queries matching public records return a **Direct Answer** immediately without asking for personal details.
4. Unlisted local queries prompt for **Applicant Details**, generate a $\le 3,000$-character portal-safe RTI draft, download a no-space PDF, and display the **Step-by-Step RTI Website Filing Guide**.
5. Saving a case and clicking **"Simulate SLA Breach"** generates and downloads a free Section 19(1) First Appeal PDF.