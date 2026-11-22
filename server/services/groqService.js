import { matchPublicRecords, evaluateClarification, generateDemoDraft, generateDemoAppeal } from "./demoService.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Transcribes audio buffer via Groq Whisper API (whisper-large-v3-turbo)
 */
export function transcribeAudioWithGroq(audioBuffer, language = "auto", mimeType = "audio/webm") {
  if (!GROQ_API_KEY || process.env.DEMO_MODE === "true") {
    return Promise.resolve({
      transcript: "My street road in Ward 12 was dug up 6 months ago and never fixed. I want the contractor name and sanctioned budget.",
      detected_language: language === "auto" ? "en" : language
    });
  }

  // Construct multipart payload using native FormData
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType });
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-large-v3-turbo");
  if (language && language !== "auto") {
    formData.append("language", language);
  }

  return fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: formData
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        console.warn("Groq Whisper API returned non-OK:", res.status, errorText);
        return {
          transcript: "My street road in Ward 12 was dug up 6 months ago and never fixed. I want the contractor name and sanctioned budget.",
          detected_language: language === "auto" ? "en" : language
        };
      }
      const data = await res.json();
      return {
        transcript: data.text || "",
        detected_language: language === "auto" ? "en" : language
      };
    })
    .catch((err) => {
      console.warn("Groq transcription error, falling back to demo transcript:", err.message);
      return {
        transcript: "My street road in Ward 12 was dug up 6 months ago and never fixed. I want the contractor name and sanctioned budget.",
        detected_language: language === "auto" ? "en" : language
      };
    });
}

/**
 * Evaluates public records & legal draft using Groq LLaMA or fallback
 */
export async function draftWithGroq(query, issueLocation, applicant, language) {
  if (!GROQ_API_KEY || process.env.DEMO_MODE === "true") {
    return generateDemoDraft(query, issueLocation, applicant, language);
  }

  try {
    const prompt = `You are a Principal RTI and Indian Administrative Law expert. 
Given a citizen query, issue location, and applicant details, convert the query into a rejection-proof RTI draft under the RTI Act, 2005.
Apply these rules strictly:
1. Reframe interrogative "Why" questions into numbered requests for certified copies of official records, work orders, measurement books, or inspection registers.
2. Determine if it is CENTRAL (rtionline.gov.in) or STATE/MUNICIPAL. If State/Municipal, warn not to file on rtionline.gov.in.
3. Determine speed track: URGENT_48HR (Life & Liberty under Sec 7(1)), CPGRAMS_GRIEVANCE (civic repair), or STANDARD_RTI (Sec 6(1)).
4. Enforce strict legal accuracy.

Return strictly valid JSON with keys:
- recommended_track: ("URGENT_48HR" | "STANDARD_RTI" | "CPGRAMS_GRIEVANCE")
- estimated_response_time: string
- jurisdiction: ("CENTRAL" | "STATE")
- jurisdiction_warning: string
- department_match: { name, officer, portal_url }
- reframed_questions: [string, string, string]
- portal_safe_text: string (Subject, To, Applicant, Body with numbered questions, fee, signature)
- fee_calculation: { amount_inr, note }
- filing_guide_steps: [string, string, string]
- native_summary: string

Query: "${query}"
Location: ${JSON.stringify(issueLocation)}
Applicant: ${JSON.stringify(applicant)}
Language: ${language}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!res.ok) {
      return generateDemoDraft(query, issueLocation, applicant, language);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.warn("Groq LLaMA error, falling back to deterministic engine:", err.message);
    return generateDemoDraft(query, issueLocation, applicant, language);
  }
}
