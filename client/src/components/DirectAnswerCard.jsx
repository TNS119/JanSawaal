import React, { useState, useEffect } from "react";
import { CheckCircle2, ExternalLink, Volume2, VolumeX, ArrowRight, RefreshCw } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/tts.js";

export default function DirectAnswerCard({
  recordData,
  language,
  onProceedToFiling,
  onReset
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (recordData?.voice_summary) {
      speakText(
        recordData.voice_summary,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
    return () => stopSpeaking();
  }, [recordData, language]);

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToRead = recordData?.voice_summary || recordData?.direct_answer;
      speakText(
        textToRead,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
              Information Already Public • No Wait Needed
            </span>

            <button
              onClick={toggleVoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? "Pause Audio" : "Listen to Answer"}</span>
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Here is the Official Information
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
            This information is already published and available to all citizens. You do not need to submit an application or pay any fees to access it.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Answer Box */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-5 sm:p-6">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-2">
              Official Rule & Guidance:
            </span>
            <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
              {recordData.direct_answer}
            </p>
          </div>

          {/* Official Source Link Card */}
          {recordData.source_url && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Official Portal
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {recordData.source_name || "Official Government Portal"}
                </span>
              </div>

              <a
                href={recordData.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Open Government Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ask Another Question</span>
            </button>

            <button
              onClick={onProceedToFiling}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Still need signed/certified copies? Prepare an RTI</span>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
