# JanSawaal (Voice-First & Fast-Track RTI Engine)

An AI-powered civic-tech platform empowering Indian citizens to access government information and redress public grievances in **English, Telugu, and Hindi** through a record-first, voice-first approach under the Right to Information (RTI) Act, 2005 and CPGRAMS.

---

## Key Capabilities

1. **Instant Public Record Check (0-Day Direct Answer):** Before requiring citizens to file an application, JanSawaal checks Section 4(1)(b) proactive public disclosures, official government portals, and municipal databases. If the information or policy is already published, it is delivered immediately with zero forms, zero fees, and zero waiting time.
2. **Pause-Proof Multilingual Voice Intake:** Citizens can speak naturally in English, Telugu (`te-IN`), or Hindi (`hi-IN`). The voice-to-type engine accumulates speech across natural thinking pauses without wiping previous sentences, and includes a one-click **Clear** button.
3. **Rejection-Proof RTI Reframer:** Automatically reframes informal citizen grievances into legally structured, numbered record requests under Section 6(1) and Section 2(j). Eliminates interrogative "Why" questions that Public Information Officers (PIOs) routinely cite to reject applications under Section 2(f).
4. **Portal-Safe Text Sanitizer:** Automatically enforces the strict 3,000-character limit and character whitelist required by the central `rtionline.gov.in` portal (`[A-Za-z0-9,.\-_()/@:&?\\%\s]`), stripping disallowed characters (quotes, semicolons, exclamations, emojis).
5. **Space-Free PDF Generator:** Generates downloadable official application PDFs with space-free filenames (e.g. `RTI_STANDARD_RTI_Nalgonda_Ward_12_20261122.pdf`), guaranteeing compliance with government portal attachment upload rules.
6. **Smart Central vs. State/Municipal Jurisdiction Routing:** Automatically detects whether an issue falls under Central Ministries or State/Municipal authorities (e.g. CDMA Telangana, HMWSSB, TSSPDCL, State Police), warning citizens against filing municipal matters on the central portal and directing them to the verified, active official portal.
7. **Statutory SLA Tracker & 1-Click First Appeal:** Tracks statutory response deadlines (48 Hours for Section 7(1) Life & Liberty urgent matters; 30 Days for standard requests). When an authority fails to respond within 30 days (Deemed Refusal), JanSawaal unlocks a one-click **Section 19(1) First Appeal Memorandum** at ₹0 fee under Section 7(6).
8. **Browser-Native History Navigation:** Fully integrated with browser routing (`react-router-dom`), allowing smooth Back and Forward navigation across all views without state loss, with automatic audio shutoff on route transitions.

---

## System Architecture

```text
IdeaForge2/
├── AGENTS.md                       # Machine-targeted agent guidelines & constraints
├── CONTEXT.md                      # File-level architecture registry with line anchors
├── rti_draft_mvp_specification.md  # Official product specification
├── implementation_plan.md          # Architectural plan & API contracts
├── .env.example                    # Environment variable template
├── server/                         # Node.js Express Backend
│   ├── data/
│   │   ├── publicRecords.json      # Proactive Section 4 public disclosures
│   │   └── departments.json        # Central Ministries & State/Municipal authorities
│   ├── routes/
│   │   ├── transcribe.js           # Audio transcription endpoint
│   │   ├── records.js              # Section 4 public records matching
│   │   ├── draft.js                # Section 6(1) RTI & Section 7(1) urgent drafting
│   │   ├── appeal.js               # Section 19(1) First Appeal generation
│   │   └── pdf.js                  # Space-free binary PDF streaming
│   ├── utils/
│   │   ├── sanitizer.js            # 3,000-char limiter & character whitelist sanitizer
│   │   └── pdfGenerator.js         # PDFKit legal document layout engine
│   └── services/
│       ├── groqService.js          # Groq Whisper STT & LLaMA 3.3 70B legal reasoning
│       ├── geminiService.js        # Google Gemini 2.5 Flash legal structured output
│       └── demoService.js          # Domain-specific civic classification engine
└── client/                         # React 18 + Vite + Tailwind CSS Frontend
    └── src/
        ├── components/
        │   ├── Header.jsx          # Civic brand header & language switcher
        │   ├── WelcomeScreen.jsx   # Plain-language welcome & privacy guarantees
        │   ├── QueryIntakeForm.jsx # Location selector, pause-proof voice & 'Check' button
        │   ├── DirectAnswerCard.jsx# 0-Day instant answer display with TTS readback
        │   ├── DraftAndGuideView.jsx# Rejection-proof draft, space-free PDF & portal guide
        │   ├── PortalFilingGuide.jsx# Verified portal redirection & step-by-step guide
        │   ├── TrackerDashboard.jsx # Statutory SLA countdown & First Appeal unlock
        │   └── VoiceClarification.jsx# Conversational follow-up for missing context
        └── utils/
            ├── api.js              # Backend REST API client
            ├── speechRecognition.js# Multilingual pause-proof speech accumulator
            ├── tts.js              # Natural neural voice synthesis
            └── sanitizer.js        # Client-side input character validation
```

---

## Quickstart & Installation

### 1. Prerequisites
- Node.js `v18+` (Tested on `v22.x`)
- npm `v9+`

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

To enable external AI models for Whisper transcription and LLaMA / Gemini legal drafting, configure your API keys in `server/.env`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## Verified Core User Journeys

### Journey 1: 0-Day Instant Resolution (Section 4 Public Disclosure)
- **Input:** *"Do I have to pay an RTI fee if I have a BPL card?"*
- **Outcome:** The engine immediately identifies the policy in Section 4 public disclosures.
- **Result:** Bypasses personal detail forms entirely, delivers the direct rule under Section 7(5) of the RTI Act (100% fee waiver for BPL citizens), provides TTS voice playback, and links directly to the official source portal.

### Journey 2: 48-Hour Urgent RTI (Section 7(1) Life & Liberty)
- **Input:** *"My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals."*
- **Outcome:** Classifies under Section 7(1) Life & Liberty provisions.
- **Result:** Generates an urgent 48-Hour RTI application demanding immediate medical records release, applies the 3,000-character portal sanitizer, formats a space-free PDF, and provides hand-delivery instructions to the Hospital Public Information Officer.

### Journey 3: State Municipal Public Works & SLA Escalation
- **Input:** *"Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details."*
- **Outcome:** Identifies Municipal Administration jurisdiction (CDMA Telangana) and warns against filing on the central portal.
- **Result:** Reframes questions into 4 certified record requests under Section 6(1) (administrative sanction, contractor details, completion deadlines, measurement book pages). Saving to "Track Applications" starts a 30-day statutory countdown. If no reply is received within 30 days, it automatically generates a ₹0 **Section 19(1) First Appeal Memorandum** citing deemed refusal.

---

## Automated Test Suite

To run backend unit tests verifying text sanitization, character sets, space-free filenames, public record matching, and PDF streaming:
```bash
cd server
npm test
```
All 9 automated unit tests run using the native Node.js test runner.

---

## Legal Compliance & Privacy Guardrails
- **No Aadhaar / PAN Collection:** JanSawaal never asks for or stores national identity cards.
- **RTI Act Compliance:** Aligns strictly with Section 2(j) (right to inspect and obtain certified records), Section 6(1) (application procedure), Section 7(1) (30-day standard and 48-hour life/liberty timelines), Section 7(5) (BPL fee waiver), and Section 19(1) (First Appeal).
- **Portal Compatibility:** Formatted to upload seamlessly to `rtionline.gov.in`, `pgportal.gov.in`, and State portals.
