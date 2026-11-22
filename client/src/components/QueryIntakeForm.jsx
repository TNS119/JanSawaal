import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, MapPin, X } from "lucide-react";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "../data/locations.js";
import { createPauseProofRecognizer } from "../utils/speechRecognition.js";
import { transcribeAudio } from "../utils/api.js";

export default function QueryIntakeForm({
  query,
  setQuery,
  issueLocation,
  setIssueLocation,
  language,
  setLanguage,
  onSubmit,
  isLoading
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [recognizer, setRecognizer] = useState(null);

  const baseTextRef = useRef("");
  const queryRef = useRef(query);
  queryRef.current = query;

  const textareaRef = useRef(null);

  const availableDistricts = DISTRICTS_BY_STATE[issueLocation.state];

  // Set up Pause-Proof recognizer
  useEffect(() => {
    const rec = createPauseProofRecognizer({
      language,
      onChunk: ({ finalText, interimText: interim }) => {
        setInterimText(interim);
        const prefix = baseTextRef.current ? baseTextRef.current.trim() + " " : "";
        const combined = (prefix + finalText).trim();
        if (combined) {
          setQuery(combined);
        }
      },
      onError: (err) => {
        console.warn("Speech error:", err);
        setIsRecording(false);
      },
      onStatusChange: ({ listening }) => {
        setIsRecording(listening);
        if (!listening) {
          setInterimText("");
        }
      }
    });

    setRecognizer(rec);

    return () => {
      if (rec) {
        rec.stop();
      }
    };
  }, [language]);

  // Handle Speech Toggle
  const toggleRecording = () => {
    if (isRecording) {
      if (recognizer) {
        recognizer.stop();
      }
      setIsRecording(false);
      setInterimText("");
    } else {
      baseTextRef.current = queryRef.current || "";
      setInterimText("");
      setIsRecording(true);

      if (recognizer) {
        recognizer.start();
      } else {
        startMediaRecorderFallback();
      }
    }
  };

  // Clear query text cleanly
  const handleClear = () => {
    setQuery("");
    setInterimText("");
    baseTextRef.current = "";
    if (isRecording && recognizer) {
      recognizer.stop();
      setIsRecording(false);
    }
  };

  // Fallback in-memory MediaRecorder for non-Chromium environments
  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        try {
          const result = await transcribeAudio(audioBlob, language);
          if (result.transcript) {
            const prefix = baseTextRef.current ? baseTextRef.current.trim() + " " : "";
            setQuery((prefix + result.transcript).trim());
          }
        } catch (err) {
          console.error("Transcription error:", err);
        }
      };

      recorder.start();
    } catch (err) {
      console.warn("Microphone access failed:", err);
      setIsRecording(false);
      alert("Microphone access unavailable. You can type directly in the box.");
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const districts = DISTRICTS_BY_STATE[newState] || [];
    setIssueLocation({
      state: newState,
      district: districts[0] || "",
      ward: issueLocation.ward
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* User-Friendly Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            What issue or government record do you need help with?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tell us about your civic problem or the records you are looking for. We will check if the information is already public or prepare an application.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Location */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Location of the Issue</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={issueLocation.state}
                  onChange={handleStateChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District / City
                </label>
                <select
                  value={issueLocation.district}
                  onChange={(e) =>
                    setIssueLocation({ ...issueLocation, district: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                >
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward / Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area / Ward / Locality (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ward 12, Ramagiri"
                  value={issueLocation.ward}
                  onChange={(e) =>
                    setIssueLocation({ ...issueLocation, ward: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Problem Description with Clear Button */}
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-bold text-slate-800">
                Describe the problem or information you need
              </label>

              {/* Actions: Clear button & Language Selector */}
              <div className="flex items-center space-x-2">
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md font-semibold transition-colors"
                    title="Clear description text"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}

                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[11px] text-slate-500 px-1.5 font-medium">Voice:</span>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${language === "en"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("te")}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${language === "te"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${language === "hi"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>

            {/* Active Listening Strip */}
            {isRecording && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700">
                <span className="font-semibold">
                  Listening ({language === "te" ? "తెలుగు" : language === "hi" ? "हिन्दी" : "English"}) — Speak naturally; pauses will not clear your words. Click the red button when finished.
                </span>
              </div>
            )}

            <div className="relative rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 bg-white transition-all">
              <textarea
                ref={textareaRef}
                rows={5}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  language === "te"
                    ? "మీ సమస్యను ఇక్కడ రాయండి లేదా మైక్ నొక్కి మాట్లాడండి (ఉదా: మా వీధిలో తాగునీటి పైపులైన్ పగిలి నీరు రావడం లేదు, లేదా రోడ్డు పనుల బడ్జెట్ మరియు కాంట్రాక్టర్ వివరాలు కావాలి)..."
                    : language === "hi"
                      ? "अपनी समस्या यहाँ लिखें या माइक दबाकर बोलें..."
                      : "Type or click the microphone to speak. You can describe your issue in your own words..."
                }
                className="w-full p-4 pr-16 text-slate-900 text-sm sm:text-base leading-relaxed bg-transparent border-0 rounded-xl focus:ring-0 resize-y"
              />

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? "Stop Listening" : "Speak to Type"}
                className={`absolute right-3.5 bottom-3.5 p-3 rounded-full transition-all shadow-sm ${isRecording
                    ? "bg-red-600 text-white animate-pulse ring-4 ring-red-200"
                    : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Interim live speech feedback */}
            {interimText && (
              <div className="mt-1.5 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                <span className="italic">"{interimText}"</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-1.5 text-xs text-slate-500">
              <span>{query.length} characters</span>
              <span>English • తెలుగు • हिन्दी</span>
            </div>
          </div>

          {/* Quick Examples
          <div className="pt-1">
            <span className="text-xs font-semibold text-slate-500 mr-2">Examples:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIssueLocation({ state: "Telangana", district: "Nalgonda", ward: "" });
                  setQuery("Do I have to pay an RTI fee if I have a BPL card?");
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors text-left"
              >
                BPL RTI Fee Exemption
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssueLocation({ state: "Telangana", district: "Nalgonda", ward: "" });
                  setQuery("My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals.");
                }}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors text-left"
              >
                Hospital MRI Report (Urgent)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssueLocation({ state: "Telangana", district: "Nalgonda", ward: "Ward 12" });
                  setQuery("Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details.");
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors text-left"
              >
                Ward 12 Road Repair Budget
              </button>
            </div>
          </div> */}

          {/* Submit Action Button: Exactly 'Check' */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              We check existing public records first to save you time and fees.
            </div>

            <button
              type="button"
              disabled={isLoading || !query.trim()}
              onClick={onSubmit}
              className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 ${isLoading || !query.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 text-white"
                }`}
            >
              <span>{isLoading ? "Checking..." : "Check"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
