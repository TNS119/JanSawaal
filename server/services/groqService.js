import { matchPublicRecords, evaluateClarification, generateDemoDraft, generateDemoAppeal } from "./demoService.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Transcribes audio buffer via Groq Whisper API (whisper-large-v3-turbo)
 */
export function transcribeAudioWithGroq(audioBuffer, language = "auto", mimeType = "audio/webm") {
  if (!GROQ_API_KEY) {
    return Promise.reject(new Error("GROQ_API_KEY is not configured for Whisper transcription. Please configure your API key for live deployment."));
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
        console.error("Groq Whisper API returned non-OK:", res.status, errorText);
        throw new Error(`Groq Whisper API error (${res.status}): ${errorText}`);
      }
      const data = await res.json();
      return {
        transcript: data.text || "",
        detected_language: language === "auto" ? "en" : language
      };
    });
}

/**
 * Evaluates public records & legal draft using Groq LLM API
 * Automatically selects verified active models (openai/gpt-oss-120b, qwen/qwen3.8-27b)
 */
export async function draftWithGroq(query, issueLocation, applicant, language) {
  if (!GROQ_API_KEY) {
    console.warn("[Groq Service] GROQ_API_KEY missing, utilizing built-in civic drafting engine.");
    return generateDemoDraft(query, issueLocation, applicant, language);
  }

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

  const modelCandidates = [
    process.env.GROQ_CHAT_MODEL,
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b"
  ].filter(Boolean);

  let lastError = null;

  for (const model of modelCandidates) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Groq Service] Model ${model} returned ${res.status}:`, errorText);
        lastError = new Error(`Groq API error (${res.status}): ${errorText}`);
        continue; // Try next candidate model
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed;
      }
    } catch (err) {
      console.warn(`[Groq Service] Error with model ${model}:`, err.message);
      lastError = err;
    }
  }

  // Graceful fallback to verified deterministic civic engine if Groq cloud fails
  console.warn("[Groq Service] All Groq model candidates failed, falling back to built-in civic drafting engine:", lastError?.message);
  return generateDemoDraft(query, issueLocation, applicant, language);
}
