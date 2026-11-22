import React, { useState, useEffect } from "react";
import { HelpCircle, Volume2, ArrowRight, CornerDownRight } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/tts.js";

export default function VoiceClarification({
  clarificationData,
  language,
  onResolveClarification
}) {
  const [answers, setAnswers] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const questions = clarificationData?.clarifying_questions || [];

  // Play voice asking the clarification questions
  useEffect(() => {
    if (questions.length > 0) {
      const prompt = `To help get the right information, please clarify: ${questions.join(". ")}`;
      speakText(
        prompt,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
    return () => stopSpeaking();
  }, [clarificationData, language]);

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleContinue = () => {
    const combinedAnswers = Object.values(answers).filter(Boolean).join(". ");
    onResolveClarification(combinedAnswers);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md border-2 border-amber-300 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>Quick Question</span>
          </div>

          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
                setIsSpeaking(false);
              } else {
                const prompt = questions.join(". ");
                speakText(
                  prompt,
                  language,
                  () => setIsSpeaking(true),
                  () => setIsSpeaking(false)
                );
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? "Pause Voice" : "Listen Again"}</span>
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          A quick detail to help us find the right information:
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {clarificationData?.reason || "This helps us identify the exact office or public record."}
        </p>

        <div className="space-y-4 mb-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                {idx + 1}. {q}
              </label>
              <div className="flex items-center space-x-2">
                <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answers[idx] || ""}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center space-x-2 transition-all"
          >
            <span>Continue With Clarification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
