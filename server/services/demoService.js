import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sanitizeRtiText, validateRtiCharset } from "../utils/sanitizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const publicRecords = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/publicRecords.json"), "utf8")
);
const departmentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/departments.json"), "utf8")
);

/**
 * Evaluates whether query matches curated public records
 */
export function matchPublicRecords(query, issueLocation = {}) {
  const q = (query || "").toLowerCase();

  // Scenario A check: BPL fee exemption
  if (
    (q.includes("bpl") || q.includes("below poverty line") || q.includes("white ration")) &&
    (q.includes("fee") || q.includes("pay") || q.includes("charge") || q.includes("cost") || q.includes("free") || q.includes("waiver"))
  ) {
    const bplRecord = publicRecords.find((r) => r.id === "bpl_rti_fee_waiver");
    if (bplRecord) {
      return {
        matched: true,
        record: bplRecord
      };
    }
  }

  // General keyword matching against publicRecords.json
  for (const record of publicRecords) {
    const hits = record.keywords.filter((k) => q.includes(k.toLowerCase()));
    if (hits.length >= 2) {
      return {
        matched: true,
        record
      };
    }
  }

  return { matched: false };
}

/**
 * Checks if query needs short clarification before proceeding
 */
export function evaluateClarification(query) {
  const q = (query || "").trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  
  // Very short query under 20 characters or fewer than 4 words
  if (q.length < 20 || words.length < 4) {
    return {
      needsClarification: true,
      questions: [
        "Which government department or project does this concern?",
        "What specific document or timeframe do you need?"
      ],
      reason: "Please provide a little more detail so we can identify the exact department or record."
    };
  }

  return { needsClarification: false, questions: [] };
}

/**
 * Intelligently classifies query into civic category, public authority, and tailored questions.
 */
function analyzeCivicTopic(query, issueLocation = {}) {
  const q = (query || "").toLowerCase();
  const district = issueLocation.district || "Local District";
  const state = issueLocation.state || "Telangana";
  const ward = issueLocation.ward ? issueLocation.ward : district;
  const locationDesc = `${ward}, ${district}`;

  // 1. Healthcare & Hospital Emergency (Life & Liberty -> 48 Hours)
  if (
    q.includes("hospital") || q.includes("mri") || q.includes("admitted") ||
    q.includes("icu") || q.includes("medical") || q.includes("doctor") ||
    q.includes("patient") || q.includes("emergency") || q.includes("scan")
  ) {
    return {
      topic: "Hospital & Medical Records",
      track: "URGENT_48HR",
      estimated_time: "Strictly 48 Hours (Section 7(1) Life & Liberty)",
      jurisdiction: "STATE",
      jurisdiction_warning: `This concerns hospital healthcare records. Submit directly to the Medical Superintendent (PIO) at Government General Hospital, ${district} in person or by Speed Post.`,
      department: {
        id: "district_general_hospital",
        name: `Government District Hospital (${district}) - Medical Superintendent`,
        officer: "Public Information Officer (Medical Superintendent / Resident Medical Officer)",
        portal_url: "https://health.telangana.gov.in/"
      },
      subject: `URGENT Application under Section 7(1) of the RTI Act, 2005 - Medical Records Concerning Life and Liberty`,
      preamble: `Under Section 6(1) read with the proviso to Section 7(1) of the RTI Act, 2005, please furnish certified medical records within forty-eight (48) hours as this directly concerns the health and life of a patient:`,
      questions: [
        `1. Provide a certified copy of the complete medical case sheet, diagnosis notes, and radiology/scan reports recorded for the patient at Government Hospital, ${district}.`,
        `2. Provide certified copies of all daily physician progress notes, medication logs, and lab diagnostic findings on record.`,
        `3. Provide a certified copy of the emergency medical assessment report and safe patient transfer/referral summary.`
      ],
      steps: [
        `1. Print 2 physical copies of this 48-Hour Urgent RTI application.`,
        `2. Submit directly to the Medical Superintendent / RMO office at Government Hospital, ${district}.`,
        `3. Hand-deliver the form and obtain a signed and dated acknowledgment receipt on the second copy.`,
        `4. Highlight Section 7(1) which legally requires delivery of records within 48 hours for medical matters.`,
        `5. Click 'Save & Track' below to start the live 48-hour countdown timer.`
      ]
    };
  }

  // 2. Drinking Water Supply & Sewerage
  if (
    q.includes("water") || q.includes("pipeline") || q.includes("tap") ||
    q.includes("drainage") || q.includes("sewerage") || q.includes("drinking water") ||
    q.includes("leak") || q.includes("contamination") || q.includes("tanker")
  ) {
    return {
      topic: "Drinking Water Supply & Drainage",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a State/Municipal water supply matter. Submit via the official Water Supply Board portal or to the Executive Engineer (Water Works), ${district}.`,
      department: {
        id: "state_water_board",
        name: `Water Supply & Sewerage Board (${district} Division)`,
        officer: "Public Information Officer (Executive Engineer / General Manager, Water Works)",
        portal_url: "https://www.hyderabadwater.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding drinking water supply and pipeline maintenance in ${locationDesc}`,
      preamble: `Please provide certified records under Section 2(j) of the RTI Act, 2005 regarding drinking water supply, pipeline infrastructure, and maintenance in ${locationDesc}:`,
      questions: [
        `1. Provide certified copies of the sanctioned budget, work order, and contractor agreement for drinking water pipeline laying and maintenance in ${locationDesc}.`,
        `2. Provide certified copies of water quality and purity test reports conducted by the laboratory for tap water supplied to ${locationDesc} over the past 6 months.`,
        `3. Provide certified extracts of the complaint register showing all citizen grievances registered regarding water leaks or low pressure in ${locationDesc} and action taken thereon.`,
        `4. Provide the stipulated schedule of drinking water supply and names of designated field engineers responsible for ${locationDesc}.`
      ],
      steps: [
        `1. Open the official Water Supply portal (https://www.hyderabadwater.gov.in/) or prepare Speed Post to Executive Engineer (Water Works).`,
        `2. Paste the application text into the online request box or print the downloaded PDF.`,
        `3. Remit the statutory Rs. 10 fee (or upload BPL proof if exempt).`,
        `4. Save your application number to track the 30-day turnaround.`
      ]
    };
  }

  // 3. Electricity / Power / Transformers / Outages
  if (
    q.includes("electricity") || q.includes("power") || q.includes("current") ||
    q.includes("transformer") || q.includes("voltage") || q.includes("discom") ||
    q.includes("meter") || q.includes("blackout") || q.includes("power cut")
  ) {
    return {
      topic: "Electricity Supply & Transformer Infrastructure",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a State Electricity DISCOM matter. Submit to the Divisional Engineer (Operation) of your local electricity distribution company.`,
      department: {
        id: "state_electricity_discom",
        name: `State Electricity Distribution Company (DISCOM - ${district} Operation)`,
        officer: "Public Information Officer (Divisional Engineer / Assistant Divisional Engineer, Operation)",
        portal_url: "https://www.tssspdcl.com/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding power outages and transformer maintenance in ${locationDesc}`,
      preamble: `Please provide certified copies and official records under Section 2(j) of the RTI Act, 2005 regarding electricity distribution and transformer maintenance in ${locationDesc}:`,
      questions: [
        `1. Provide certified copy of the logbook of unscheduled power outages, tripping events, and load shedding recorded for ${locationDesc} over the last 3 months.`,
        `2. Provide certified copies of work orders and inspection reports for the replacement or repair of the distribution transformer serving ${locationDesc}.`,
        `3. Provide the sanctioned load capacity versus peak recorded demand for the transformer/feeder line serving ${locationDesc}.`,
        `4. Provide certified copy of citizen complaints registered regarding voltage fluctuations or burnt equipment in ${locationDesc} and status of resolution.`
      ],
      steps: [
        `1. Open the State Electricity DISCOM portal (https://www.tssspdcl.com/) or prepare Speed Post to Divisional Engineer.`,
        `2. Paste the application text into the grievance/RTI form.`,
        `3. Pay the Rs. 10 fee (or attach BPL card copy).`,
        `4. Save your reference number to track resolution.`
      ]
    };
  }

  // 4. Sanitation / Garbage / Cleanliness
  if (
    q.includes("garbage") || q.includes("waste") || q.includes("sanitation") ||
    q.includes("dustbin") || q.includes("sweeping") || q.includes("cleaning") ||
    q.includes("mosquito") || q.includes("fogging") || q.includes("drain")
  ) {
    return {
      topic: "Municipal Sanitation & Waste Clearance",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a municipal sanitation matter. Submit via the State Municipal Administration portal or directly to the Municipal Commissioner.`,
      department: {
        id: "municipal_health_sanitation",
        name: `${district} Municipal Corporation (Sanitation & Health Wing)`,
        officer: "Public Information Officer (Chief Health Officer / Sanitation Inspector)",
        portal_url: "https://cdma.telangana.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding sanitation, garbage lifting, and public health in ${locationDesc}`,
      preamble: `Please provide certified records under Section 2(j) of the RTI Act, 2005 regarding municipal solid waste management and sanitation in ${locationDesc}:`,
      questions: [
        `1. Provide certified copy of the daily sanitation and door-to-door garbage collection schedule assigned to ${locationDesc}.`,
        `2. Provide the registered name, contact details, and contract agreement of the agency/contractor assigned for solid waste management in ${locationDesc}.`,
        `3. Provide certified extracts of vehicle GPS logs and garbage trip sheets recorded for waste lifted from ${locationDesc} in the last 60 days.`,
        `4. Provide certified copies of bleaching, anti-larval spray, and mosquito fogging schedules recorded by the sanitation inspector for ${locationDesc}.`
      ],
      steps: [
        `1. Open the State Municipal portal (https://cdma.telangana.gov.in/) or prepare letter to the Municipal Commissioner.`,
        `2. Paste the application text into the online application form.`,
        `3. Remit the Rs. 10 fee (or claim BPL exemption).`,
        `4. Save your tracking slip in My Cases.`
      ]
    };
  }

  // 5. Illegal Construction / Town Planning / Encroachments
  if (
    q.includes("construction") || q.includes("building") || q.includes("encroachment") ||
    q.includes("illegal") || q.includes("setback") || q.includes("permission") ||
    q.includes("floors") || q.includes("layout") || q.includes("demolition")
  ) {
    return {
      topic: "Building Permission & Town Planning Records",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This concerns municipal town planning. Submit via the Municipal Town Planning department or State Urban Development Authority.`,
      department: {
        id: "municipal_town_planning",
        name: `${district} Municipal Corporation (Town Planning Wing)`,
        officer: "Public Information Officer (City Planner / Town Planning Officer)",
        portal_url: "https://cdma.telangana.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding building permissions and encroachment inspection in ${locationDesc}`,
      preamble: `Please furnish certified copies of official records under Section 2(j) of the RTI Act, 2005 regarding building permissions and structural compliance in ${locationDesc}:`,
      questions: [
        `1. Provide a certified copy of the building permission, sanctioned architectural plan, and approved number of floors for the construction at ${locationDesc}.`,
        `2. Provide a certified copy of the site inspection report and occupancy certificate (OC) issued by the Town Planning officer.`,
        `3. Provide certified copies of any show-cause notices or stop-work orders issued regarding unauthorized construction or setback deviations at ${locationDesc}.`,
        `4. Provide the action taken report and file notings regarding citizen complaints submitted against illegal construction at this location.`
      ],
      steps: [
        `1. Open the State Municipal portal (https://cdma.telangana.gov.in/) or prepare Speed Post to City Planner.`,
        `2. Paste the application text into the form.`,
        `3. Pay Rs. 10 application fee.`,
        `4. Track your 30-day deadline in My Cases.`
      ]
    };
  }

  // 6. Land Records / Patta / Mutation / Tahsildar
  if (
    q.includes("land") || q.includes("patta") || q.includes("passbook") ||
    q.includes("dharani") || q.includes("survey") || q.includes("mutation") ||
    q.includes("tahsildar") || q.includes("mro") || q.includes("revenue") || q.includes("acre")
  ) {
    return {
      topic: "Revenue Land Records & Mutation",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a State Revenue department matter. Submit to the Tahsildar / Mandal Revenue Office or District Collectorate.`,
      department: {
        id: "tahsildar_mandal_office",
        name: `Tahsildar / Mandal Revenue Office (MRO - ${district})`,
        officer: "Public Information Officer (Tahsildar / Deputy Tahsildar)",
        portal_url: "https://ccla.telangana.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding land records, survey numbers, and mutation in ${locationDesc}`,
      preamble: `Please furnish certified copies and extracts under Section 2(j) of the RTI Act, 2005 from the revenue registers regarding land in ${locationDesc}:`,
      questions: [
        `1. Provide certified copies of the Pahani / ROR-1B / Adangal register entries for the survey numbers located in ${locationDesc}.`,
        `2. Provide certified copies of the field inspection report, survey sketch, and panchanama prepared by the Mandal Surveyor.`,
        `3. Provide certified file notings and current status regarding the pending application for mutation / patta passbook issuance.`,
        `4. Provide certified copies of all notices issued to interested parties and orders passed in the revenue case.`
      ],
      steps: [
        `1. Open the State Revenue portal (https://ccla.telangana.gov.in/) or prepare Speed Post to the Tahsildar.`,
        `2. Affix Rs. 10 Court Fee Stamp or Indian Postal Order.`,
        `3. Save your postal or online tracking slip in My Cases.`
      ]
    };
  }

  // 7. Police / FIR / Crime Records
  if (
    q.includes("police") || q.includes("fir") || q.includes("complaint") ||
    q.includes("theft") || q.includes("station") || q.includes("inspector") ||
    q.includes("sho") || q.includes("investigation")
  ) {
    return {
      topic: "Police Station Records & FIR Status",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a Police Department matter. Submit to the Public Information Officer at the District SP Office / Police Commissionerate.`,
      department: {
        id: "state_police_commissionerate",
        name: `District Police Office / Commissionerate (${district})`,
        officer: "Public Information Officer (Deputy Superintendent of Police / ACP)",
        portal_url: "https://tspolice.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding complaint registration and FIR status in ${locationDesc}`,
      preamble: `Please furnish certified copies of police station records under Section 2(j) of the RTI Act, 2005 regarding the complaint lodged at ${locationDesc}:`,
      questions: [
        `1. Provide a certified copy of the First Information Report (FIR) or General Diary (GD) entry registered on the complaint filed by the applicant.`,
        `2. Provide the name and official designation of the Investigating Officer (IO) assigned to inquire into the complaint.`,
        `3. Provide a certified copy of the Action Taken Report (ATR) and progress summary of inquiry conducted to date.`,
        `4. Provide certified copies of any preliminary inquiry notices or closure reports submitted in the matter.`
      ],
      steps: [
        `1. Open the State Police Portal (https://tspolice.gov.in/) or prepare letter to District Police Office.`,
        `2. Pay the statutory Rs. 10 fee.`,
        `3. Track your request deadline in My Cases.`
      ]
    };
  }

  // 8. Ration / PDS / Fair Price Shops
  if (
    q.includes("ration") || q.includes("pds") || q.includes("rice") ||
    q.includes("dealer") || q.includes("fair price") || q.includes("foodgrain") ||
    q.includes("quota") || q.includes("wheat")
  ) {
    return {
      topic: "Civil Supplies & Ration Distribution",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "STATE",
      jurisdiction_warning: `This is a State Civil Supplies matter. Submit to the District Supply Officer (Collectorate complex).`,
      department: {
        id: "state_civil_supplies",
        name: `Civil Supplies Corporation / District Supply Office (${district})`,
        officer: "Public Information Officer (District Supply Officer / Asst. Food Controller)",
        portal_url: "https://epds.telangana.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding foodgrain allotment and Fair Price Shop distribution in ${locationDesc}`,
      preamble: `Please provide certified records under Section 2(j) of the RTI Act, 2005 regarding public distribution of foodgrains in ${locationDesc}:`,
      questions: [
        `1. Provide certified copy of the monthly foodgrain stock allotment and lifting register for the Fair Price Shop serving ${locationDesc} for the last 6 months.`,
        `2. Provide certified copies of inspection registers and biometric transaction success logs recorded for the Fair Price Shop dealer.`,
        `3. Provide details of action taken on complaints submitted regarding dealer irregularities or refusal to disburse quota in ${locationDesc}.`,
        `4. Provide certified list of active ration cards mapped to the fair price shop and sanctioned monthly allocation.`
      ],
      steps: [
        `1. Open the State Food & Civil Supplies portal (https://epds.telangana.gov.in/).`,
        `2. Submit request with Rs. 10 fee or BPL exemption.`,
        `3. Track in My Cases.`
      ]
    };
  }

  // 9. Central Matters: EPFO / Provident Fund / Pensions
  if (
    q.includes("pf") || q.includes("epfo") || q.includes("provident fund") ||
    q.includes("uan") || q.includes("pension") || q.includes("pensioner")
  ) {
    return {
      topic: "EPFO Provident Fund & Pension Claims",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "CENTRAL",
      jurisdiction_warning: `This is a Central Government / EPFO matter. Submit directly on the Central RTI Portal: https://rtionline.gov.in/`,
      department: {
        id: "epfo",
        name: "Employees' Provident Fund Organisation (EPFO)",
        officer: "Central Public Information Officer (CPIO)",
        portal_url: "https://rtionline.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding settlement of EPF and Pension claim`,
      preamble: `Please furnish official information and certified file records under Section 2(j) of the RTI Act, 2005 regarding the pending EPF claim:`,
      questions: [
        `1. Provide the current stage and certified file notings regarding the settlement of EPF / Pension claim submitted under the applicant's UAN.`,
        `2. Provide specific administrative reasons recorded on file for delay in disbursement beyond the mandated 20-day citizen charter timeline.`,
        `3. Provide the name and designation of the dealing officer with whom the claim is currently pending.`,
        `4. Provide transaction details and UTR number if any payment has been processed.`
      ],
      steps: [
        `1. Open Central RTI Online: https://rtionline.gov.in/ and click 'Submit Request'.`,
        `2. Select Ministry/Department: 'Ministry of Labour and Employment' -> 'Employees' Provident Fund Organisation (EPFO)'.`,
        `3. Paste the application text into the request box.`,
        `4. Pay Rs. 10 fee online or upload BPL proof.`,
        `5. Save your 14-digit registration number in My Cases.`
      ]
    };
  }

  // 10. Central Matters: Railways
  if (
    q.includes("railway") || q.includes("train") || q.includes("station") ||
    q.includes("railways") || q.includes("irctc") || q.includes("platform")
  ) {
    return {
      topic: "Indian Railways Operations & Amenities",
      track: "STANDARD_RTI",
      estimated_time: "Up to 30 Days (Section 7(1))",
      jurisdiction: "CENTRAL",
      jurisdiction_warning: `This is a Central Ministry matter. Submit on the Central RTI Portal: https://rtionline.gov.in/`,
      department: {
        id: "railways",
        name: "Ministry of Railways (Railway Board)",
        officer: "Central Public Information Officer (CPIO)",
        portal_url: "https://rtionline.gov.in/"
      },
      subject: `Application under Section 6(1) of the RTI Act, 2005 regarding railway operations and passenger facilities`,
      preamble: `Please furnish certified records under Section 2(j) of the RTI Act, 2005 regarding railway facilities and operations:`,
      questions: [
        `1. Provide certified copy of passenger amenity funds sanctioned and expenditure incurred at the concerned railway station for FY 2025-26.`,
        `2. Provide certified copy of action taken and inquiry report on the complaint registered by the applicant.`,
        `3. Provide operational logs and punctuality records of the train services concerning the inquiry.`
      ],
      steps: [
        `1. Open https://rtionline.gov.in/ and select 'Ministry of Railways'.`,
        `2. Paste the application text and pay Rs. 10 fee.`,
        `3. Track in My Cases.`
      ]
    };
  }

  // 11. Default / Municipal Works & Road Repairs
  return {
    topic: "Civic Works & Public Expenditure",
    track: "STANDARD_RTI",
    estimated_time: "Up to 30 Days (Section 7(1))",
    jurisdiction: "STATE",
    jurisdiction_warning: `This is a Municipal/State matter. Do NOT file on rtionline.gov.in; submit via the State Municipal portal (https://cdma.telangana.gov.in/) or by Registered Speed Post to the Municipal Commissioner.`,
    department: {
      id: "municipal_engineering",
      name: `${district} Municipal Corporation (Engineering & Works Wing)`,
      officer: `Public Information Officer (Executive Engineer / Municipal Commissioner)`,
      portal_url: "https://cdma.telangana.gov.in/"
    },
    subject: `Application under Section 6(1) of the RTI Act, 2005 regarding public works and civic expenditure in ${locationDesc}`,
    preamble: `Please provide certified records and documents under Section 2(j) of the RTI Act, 2005 regarding public works in ${locationDesc}:`,
    questions: [
      `1. Provide a certified copy of the administrative sanction, budget estimate, and work order for civic works executed in ${locationDesc} for FY 2025-26.`,
      `2. Provide the registered business name, contractor license details, and contact address of the agency awarded the contract.`,
      `3. Provide the stipulated start date, agreed completion deadline, and penalty clauses for delay specified in the tender agreement.`,
      `4. Provide certified copies of Measurement Book (MB) entries, quality test certificates, and site inspection diaries recorded by the Executive Engineer.`
    ],
    steps: [
      `1. Open the State Municipal portal: https://cdma.telangana.gov.in/ (or prepare Speed Post to Municipal Commissioner, ${district}).`,
      `2. Paste the application text into the online application form.`,
      `3. Pay the Rs. 10 fee (or upload BPL certificate for fee waiver).`,
      `4. Save your application number to track the 30-day deadline in My Cases.`
    ]
  };
}

/**
 * Generates dynamic, context-specific RTI Draft tailored to the citizen's exact query
 */
export function generateDemoDraft(query, issueLocation = {}, applicant = {}, language = "en") {
  const q = (query || "").trim();
  const district = issueLocation.district || "Nalgonda";
  const state = issueLocation.state || "Telangana";
  const ward = issueLocation.ward ? issueLocation.ward : "";
  const applicantName = applicant.name || "Ramesh Kumar";
  const applicantAddress = applicant.address || `H.No 4-2-11, Ramagiri, ${district}, ${state} - 508001`;
  const isBpl = Boolean(applicant.is_bpl);

  // Dynamically analyze the topic from user's exact query
  const analysis = analyzeCivicTopic(q, issueLocation);

  const rawPortalText = `${analysis.subject}\n\n` +
    `To:\n${analysis.department.officer},\n${analysis.department.name},\n${district}, ${state}.\n\n` +
    `Applicant: ${applicantName}, ${applicantAddress}.\n\n` +
    `Respected Authority,\n` +
    `${analysis.preamble}\n\n` +
    analysis.questions.join("\n") + "\n\n" +
    `${isBpl ? "Fee is exempt under Section 7(5) of the RTI Act (BPL card holder copy attached)." : "Statutory application fee of Rs. 10 is paid via Postal Order / Online Portal."}\n\n` +
    `Yours faithfully,\n${applicantName}`;

  const portalSafeText = sanitizeRtiText(rawPortalText);

  return {
    recommended_track: analysis.track,
    estimated_response_time: analysis.estimated_time,
    jurisdiction: analysis.jurisdiction,
    jurisdiction_warning: analysis.jurisdiction_warning,
    department_match: analysis.department,
    reframed_questions: analysis.questions,
    portal_safe_text: portalSafeText,
    char_count: portalSafeText.length,
    fee_calculation: {
      amount_inr: isBpl ? 0 : 10,
      note: isBpl ? "Exempt under Section 7(5) - BPL Card Holder" : "Standard Rs. 10 fee via Portal or Indian Postal Order"
    },
    filing_guide_steps: analysis.steps,
    rejection_audit: {
      no_why_questions: true,
      no_section_8_violation: true,
      within_3000_chars: portalSafeText.length <= 3000,
      portal_safe_charset: validateRtiCharset(portalSafeText).isValid
    },
    native_summary: `Your official RTI draft for ${analysis.topic} in ${ward ? ward + ", " : ""}${district} is ready. We have reframed your query into legal Section 6(1) record requests with zero 'Why' questions.`
  };
}

/**
 * Generates deterministic First Appeal draft under Section 19(1)
 */
export function generateDemoAppeal(data) {
  const caseId = data.caseId || `CASE-${Date.now()}`;
  const applicantName = data.applicant?.name || "Ramesh Kumar";
  const applicantAddress = data.applicant?.address || "H.No 4-2-11, Ramagiri, Nalgonda, Telangana - 508001";
  const deptName = data.department_match?.name || "Concerned Public Authority";
  const filingDate = data.filingDate || "31 days ago";
  const regNumber = data.registrationNumber || "RTI/NMC/2026/00142";

  const rawAppealText = `Subject: First Appeal under Section 19(1) of the RTI Act, 2005 against Deemed Refusal.\n\n` +
    `To:\nThe First Appellate Authority (FAA),\n${deptName}.\n\n` +
    `Appellant: ${applicantName}, ${applicantAddress}.\n` +
    `Original RTI Reg No: ${regNumber} filed on ${filingDate}.\n\n` +
    `Respected Authority,\n` +
    `1. The appellant filed an application under Section 6(1) of the RTI Act, 2005 on ${filingDate} seeking certified records.\n` +
    `2. The statutory period of thirty (30) days prescribed under Section 7(1) expired without any response or communication from the Public Information Officer (PIO).\n` +
    `3. Under Section 7(2) of the RTI Act, 2005, failure of the PIO to respond within the stipulated period is deemed to be a refusal of the request.\n` +
    `4. Under Section 7(6), where the public authority fails to provide information within the statutory period, the information shall be provided free of all charges.\n\n` +
    `PRAYER:\n` +
    `The appellant prays that the First Appellate Authority direct the PIO to immediately furnish all certified records free of cost as mandated by Section 7(6) of the RTI Act, 2005, and initiate penal recommendations under Section 20.\n\n` +
    `Yours faithfully,\n${applicantName}`;

  const portalSafeText = sanitizeRtiText(rawAppealText);

  return {
    caseId,
    appeal_title: "First Appeal under Section 19(1) of the Right to Information Act, 2005",
    faa_recipient: `The First Appellate Authority (FAA), ${deptName}`,
    legal_grounds: "Deemed refusal under Section 7(2) due to non-response within the statutory 30-day SLA. Information must now be provided completely free of charge under Section 7(6).",
    portal_safe_text: portalSafeText,
    char_count: portalSafeText.length,
    filing_instructions: [
      `1. Download the generated Section 19(1) First Appeal PDF.`,
      `2. Submit this First Appeal to the First Appellate Authority (FAA) via State RTI Portal or Registered Speed Post with Acknowledgment Due (RPAD).`,
      `3. Attach a copy of your original RTI application and initial fee receipt/tracking slip.`,
      `4. Under Central and State RTI rules, NO application fee is payable for filing a First Appeal.`,
      `5. The First Appellate Authority is statutorily mandated to dispose of this appeal within 30 days.`
    ],
    rejection_audit: {
      no_why_questions: true,
      no_section_8_violation: true,
      within_3000_chars: portalSafeText.length <= 3000,
      portal_safe_charset: validateRtiCharset(portalSafeText).isValid
    }
  };
}
