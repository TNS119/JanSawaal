# JanSawaal (Voice-First & Fast-Track RTI Engine)

An AI-powered civic-tech platform empowering Indian citizens to access government information and resolve public grievances in **English, Telugu, and Hindi** through a record-first, voice-first approach.

---

## Key Features

1. **Checks Public Records First (0-Day Direct Answer):** Before forcing citizens to file an RTI, queries are matched against Section 4(1)(b) proactive disclosures, welfare portals, and municipal dashboards. If information is already public, it is delivered instantly with zero forms, zero fees, and zero waiting.
2. **Rejection-Proof RTI Reframer:** Citizen questions are reframed into legally certified record requests under Section 6(1) and Section 2(j). Interrogative "Why" questions are eliminated, preventing automatic rejection under Section 2(f).
3. **Strict RTI Online Sanitizer:** Sanitizes text to $\le 3,000$ characters and enforces the strict character set allowed by `rtionline.gov.in` (`A-Z a-z 0-9 , . - _ ( ) / @ : & ? \ % \s`).
4. **Space-Free PDF Filenames:** Downloads official RTI and Appeal PDFs guaranteed to have zero spaces in their filenames, avoiding portal upload rejection.
5. **Central vs. State Jurisdiction Warning:** Identifies municipal and state matters and explicitly warns citizens not to waste money filing on `rtionline.gov.in`.
6. **Live SLA Tracker & SLA Breach Simulator:** Tracks 48-Hour, 3-Day, and 30-Day statutory deadlines in "My Cases". Includes a "Simulate SLA Breach (No Reply)" demo button that automatically unlocks a free **Section 19(1) First Appeal PDF** under the Section 7(6) free information mandate.

---

## Repository Structure

```text
IdeaForge2/
├── AGENTS.md                       # Agent instructions, boundaries & commands
├── CONTEXT.md                      # File-level architecture registry
├── rti_draft_mvp_specification.md  # Official product specification
├── implementation_plan.md          # Implementation plan & contracts
├── .env.example                    # Environment variable template
├── server/                         # Node.js + Express Backend
│   ├── data/
│   │   ├── publicRecords.json      # 8+ verified public records
│   │   └── departments.json        # 30 Central + 20 State/Municipal directories
│   ├── routes/                     # REST API endpoints
│   ├── utils/                      # Sanitizer & PDF generator
│   └── services/                   # Groq, Gemini & deterministic demo engine
└── client/                         # React 18 + Vite + Tailwind CSS
    └── src/
        ├── components/             # High-contrast accessible UI components
        └── utils/                  # Speech, TTS, and API wrappers
```

---

## Quickstart

### 1. Prerequisites
- Node.js `v18+` (Tested on `v22.23.2`)
- npm `v9+`

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`. By default, it operates in **`DEMO_MODE=true`**, providing deterministic responses without needing external API keys.

To use live AI models, set your keys in `server/.env`:
```env
PORT=5000
DEMO_MODE=false
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 3 One-Click Judge Demo Scenarios

Use the **"Demo Controls"** drawer in the header to run all three scenarios instantly:

- **Scenario A (Path A — 0-Day Instant Answer):**
  *"Do I have to pay an RTI fee if I have a BPL card?"*
  $\rightarrow$ Bypasses applicant form completely; returns Section 7(5) exemption rule, official source link, and TTS readback.
- **Scenario B (Path B — 48-Hour Urgent RTI):**
  *"My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals."*
  $\rightarrow$ Prompts for applicant details; triggers 48-Hour Section 7(1) Life & Liberty track; downloads `RTI_URGENT_48HR_...pdf` and provides hospital PIO hand-delivery guide.
- **Scenario C (Path B — State RTI + SLA Breach Escalation):**
  *"Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details."*
  $\rightarrow$ Flags State/Municipal jurisdiction; sanitizes text to $\le 3,000$ characters; downloads `RTI_STANDARD_RTI_...pdf`; saves to "My Cases". Clicking **"Simulate SLA Breach (No Reply)"** flips status to `OVERDUE` and generates a free **Section 19(1) First Appeal PDF**.
