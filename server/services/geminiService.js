import { generateDemoDraft } from "./demoService.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Calls Gemini API if configured, otherwise falls back to deterministic engine
 */
export async function draftWithGemini(query, issueLocation, applicant, language) {
  if (!GEMINI_API_KEY || process.env.DEMO_MODE === "true") {
    return generateDemoDraft(query, issueLocation, applicant, language);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `You are an RTI legal expert in India. Analyze this citizen query and return JSON:
Query: "${query}"
Location: ${JSON.stringify(issueLocation)}
Applicant: ${JSON.stringify(applicant)}
Language: ${language}

Return valid JSON with:
recommended_track, estimated_response_time, jurisdiction, jurisdiction_warning, department_match, reframed_questions, portal_safe_text, fee_calculation, filing_guide_steps, native_summary`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      return generateDemoDraft(query, issueLocation, applicant, language);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch (err) {
    console.warn("Gemini error, using deterministic legal fallback:", err.message);
    return generateDemoDraft(query, issueLocation, applicant, language);
  }
}
