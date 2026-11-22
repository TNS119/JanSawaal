/**
 * Advanced Neural Human-Feel Voice Engine for JanSawaal
 * Prioritizes natural, expressive, human voices over robotic synthesizers.
 * Supports English (India/UK/US), Telugu (te-IN), and Hindi (hi-IN).
 */

let cachedVoices = [];

// Pre-populate voices and listen for asynchronous voice loading in Chromium/Edge
function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Finds the highest quality, most natural human voice for the target language.
 * Scored by Neural/Natural flags, regional accent authenticity, and gender warmth.
 */
function selectBestHumanVoice(language = "en") {
  if (!cachedVoices || cachedVoices.length === 0) {
    loadVoices();
  }

  const lang = (language || "en").toLowerCase();
  let targetCode = "en-IN";
  if (lang === "te") targetCode = "te-IN";
  if (lang === "hi") targetCode = "hi-IN";

  // Score candidate voices
  const scored = cachedVoices.map((voice) => {
    let score = 0;
    const name = voice.name.toLowerCase();
    const vlang = voice.lang.toLowerCase();

    // 1. Language matching
    if (vlang === targetCode.toLowerCase()) {
      score += 120;
    } else if (vlang.startsWith(targetCode.slice(0, 2))) {
      score += 60;
    } else if (lang === "en" && (vlang.includes("en-gb") || vlang.includes("en-us"))) {
      score += 30;
    }

    // 2. Natural / Neural / Online engine markers (indicates high quality deep learning voice)
    if (name.includes("natural") || name.includes("online (natural)")) {
      score += 200;
    }
    if (name.includes("neural") || name.includes("studio") || name.includes("wavenet")) {
      score += 150;
    }
    if (name.includes("google")) {
      score += 100;
    }

    // 3. Known pleasant human voices on Windows / Edge / Android / Chrome
    // Indian English
    if (name.includes("neerja") || name.includes("prabhat") || name.includes("heera") || name.includes("ravi") || name.includes("kavya")) {
      score += 180;
    }
    // Telugu
    if (name.includes("mohan") || name.includes("swara") || name.includes("telugu")) {
      score += 180;
    }
    // Hindi
    if (name.includes("madhur") || name.includes("swara") || name.includes("kalpana") || name.includes("hindi")) {
      score += 180;
    }
    // Pleasant English fallbacks
    if (name.includes("jenny") || name.includes("aria") || name.includes("sonia") || name.includes("libby")) {
      score += 70;
    }

    // 4. Heavily penalize legacy robotic desktop synthesizers
    if (name.includes("desktop") || name.includes("david") || name.includes("espeak") || name.includes("msss") || name.includes("mark")) {
      score -= 200;
    }

    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.length > 0 && scored[0].score > -100 ? scored[0].voice : null;
}

/**
 * Normalizes speech text to remove legal boilerplate brackets, URLs, and formatting
 * so that readback sounds conversational and human.
 */
function cleanSpeechText(text) {
  if (!text) return "";
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\[\]\(\)\{\}]/g, " ")
    .replace(/Section \d+\(\d+\)/gi, (m) => m)
    .replace(/Rs\.\s*(\d+)/gi, "$1 rupees")
    .replace(/[#*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Speaks text using the best natural neural human voice available.
 */
export function speakText(text, language = "en", onStart = () => {}, onEnd = () => {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser environment.");
    return;
  }

  // Cancel any ongoing robotic speech immediately
  window.speechSynthesis.cancel();

  const cleaned = cleanSpeechText(text);
  if (!cleaned) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const bestVoice = selectBestHumanVoice(language);

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  } else {
    utterance.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
  }

  // Calibrate acoustic parameters for human warmth:
  // - Slower rate (0.92) gives pleasant clarity and cadence
  // - Slightly elevated pitch (1.02) removes dull robotic monotony
  utterance.rate = 0.92;
  utterance.pitch = 1.02;
  utterance.volume = 1.0;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = (e) => {
    // Normal Chromium/Edge cancellation on route changes or stop calls
    if (e.error !== "canceled" && e.error !== "interrupted") {
      console.warn("TTS Playback issue:", e);
    }
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
