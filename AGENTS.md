# AGENTS.md — JanSawaal (Voice-First & Fast-Track RTI Engine)

Dense, actionable instructions for AI agents operating on this repository.

---

## 1. Executable Commands

### Server (Node.js Express)
- **Install dependencies:** `cd server && npm install`
- **Run dev server:** `cd server && npm run dev`
- **Run production server:** `cd server && npm start`
- **Run unit tests:** `cd server && npm test`
- **Port:** `http://localhost:5000`

### Client (React Vite)
- **Install dependencies:** `cd client && npm install`
- **Run dev server:** `cd client && npm run dev`
- **Build production bundle:** `cd client && npm run build`
- **Preview build:** `cd client && npm run preview`
- **Port:** `http://localhost:5173`

---

## 2. Three-Tier Boundaries & Guardrails

### Always Do (✅)
1. **Sanitize Portal Text:** Enforce `sanitizeRtiText` ($\le 3,000$ characters and allowed RTI Online charset `[A-Za-z0-9,.\-_()/@:&?\\%\s]`).
2. **Space-Free PDF Filenames:** Guarantee downloaded PDF filenames contain zero spaces (e.g., `RTI_STANDARD_RTI_Nalgonda_Ward_12_20261122.pdf`).
3. **In-Memory Audio Handling:** Use `multer.memoryStorage()` for all audio uploads. Never write unmanaged temporary audio files to disk.
4. **Deterministic Engine:** Maintain built-in civic classification and public records evaluation across all API endpoints.
5. **Direct Answer Gate:** Return Section 4 public disclosures immediately without collecting citizen personal information.

### Ask First (⚠️)
1. Adding external database daemons (PostgreSQL, MongoDB) when client `localStorage` is specified.
2. Modifying the statutory fee structure or legal section citations without statutory reference.

### Never Do (🚫)
1. **Never Collect Aadhaar / PAN:** Never prompt for or store Indian government identification numbers.
2. **Never Run Git Commands Automatically:** Always present git operations to the user for explicit confirmation (Rule 3).
3. **Never Output Disallowed Characters to Portal Box:** Quotes, semicolons, exclamations, brackets, and emojis must be stripped or transformed.
4. **Never File Municipal Issues on Central Portal:** Always warn citizens if their jurisdiction is State/Municipal to prevent loss of fees.

---

## 3. Concrete Code Patterns

### Good ✅ (Sanitizing and Limiting Portal Text)
```javascript
import { sanitizeRtiText, validateRtiCharset } from "../utils/sanitizer.js";

const cleanText = sanitizeRtiText(rawUserInput, 3000);
const validation = validateRtiCharset(cleanText, 3000);
if (!validation.isValid) {
  throw new Error("Invalid characters detected for RTI Online portal");
}
```

### Bad ❌ (Raw User String Injection)
```javascript
// BAD: Fails on rtionline.gov.in due to quotes, semicolons, or >3000 characters
const portalText = "Why was the road not paved? It's unacceptable!";
```

---

## 4. Architectural Domain Index
- **Public Records DB:** `server/data/publicRecords.json`
- **Departments Directory:** `server/data/departments.json`
- **Text & Filename Sanitizer:** `server/utils/sanitizer.js`
- **PDF Generation Engine:** `server/utils/pdfGenerator.js`
- **Voice Synthesis & STT:** `client/src/utils/tts.js`, `client/src/utils/speechRecognition.js`
- **SLA Tracker & First Appeal:** `client/src/components/TrackerDashboard.jsx`, `server/routes/appeal.js`
