/**
 * Pause-Proof, Multilingual Speech Recognition Engine
 * Engineered for natural human speech with pauses, accents, and code-switching.
 * Supports:
 * - English (en-IN)
 * - Telugu (te-IN)
 * - Hindi (hi-IN)
 */

export function createPauseProofRecognizer({
  language = "en",
  onChunk = () => {},
  onError = () => {},
  onStatusChange = () => {}
}) {
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    return null;
  }

  let recognition = null;
  let isActive = false;
  let restartTimer = null;

  // Map language to BCP-47 locale tag
  const getLangCode = (lang) => {
    if (lang === "te") return "te-IN";
    if (lang === "hi") return "hi-IN";
    return "en-IN";
  };

  const initInstance = () => {
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {}
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getLangCode(language);

    recognition.onstart = () => {
      onStatusChange({ listening: true });
    };

    recognition.onresult = (event) => {
      let finalBatch = "";
      let interimBatch = "";

      // Accumulate across the entire session results to prevent wiping out prior sentences
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalBatch += item[0].transcript + " ";
        } else {
          interimBatch += item[0].transcript;
        }
      }

      onChunk({
        finalText: finalBatch.trim(),
        interimText: interimBatch.trim()
      });
    };

    recognition.onerror = (event) => {
      // "no-speech" is normal when pausing to think; do not abort on no-speech
      if (event.error === "no-speech") {
        return;
      }
      console.warn("Speech recognition notice:", event.error);
      if (event.error === "not-allowed") {
        isActive = false;
        onStatusChange({ listening: false });
        onError("Microphone permission was denied.");
      }
    };

    // Auto-restart on natural pause / silence timeout if user is still in recording mode
    recognition.onend = () => {
      if (isActive) {
        // Schedule immediate seamless restart so silence pauses don't cut off speech
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
          if (isActive && recognition) {
            try {
              recognition.start();
            } catch (e) {
              // Re-initialize if browser state was invalidated
              initInstance();
              try {
                recognition.start();
              } catch (err) {}
            }
          }
        }, 100);
      } else {
        onStatusChange({ listening: false });
      }
    };
  };

  initInstance();

  return {
    start: () => {
      isActive = true;
      try {
        recognition.start();
      } catch (e) {
        initInstance();
        try {
          recognition.start();
        } catch (err) {
          console.warn("Could not start speech recognition:", err);
        }
      }
    },
    stop: () => {
      isActive = false;
      clearTimeout(restartTimer);
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      onStatusChange({ listening: false });
    },
    setLanguage: (newLang) => {
      language = newLang;
      const wasActive = isActive;
      if (wasActive) {
        isActive = false;
        clearTimeout(restartTimer);
      }
      initInstance();
      if (wasActive) {
        isActive = true;
        try {
          recognition.start();
        } catch (e) {}
      }
    }
  };
}
