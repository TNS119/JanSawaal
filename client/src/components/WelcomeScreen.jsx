import React from "react";
import { Mic, ArrowRight } from "lucide-react";

export default function WelcomeScreen({ onStart, language = "en" }) {
  const getGreeting = () => {
    if (language === "te") {
      return {
        badge: "ఉచిత పౌర సేవ • సమాచార హక్కు చట్టం (RTI)",
        title: "జనసవాల్ (JanSawaal)",
        subtitle: "మీ సమస్యను లేదా అవసరమైన ప్రభుత్వ రికార్డులను మాట్లాడండి లేదా రాయండి. మేము పబ్లిక్ రికార్డులను శోధిస్తాము లేదా దరఖాస్తును సిద్ధం చేస్తాము.",
        cta: "సమస్యను నమోదు చేయండి"
      };
    }
    if (language === "hi") {
      return {
        badge: "निःशुल्क नागरिक सेवा • सूचना का अधिकार अधिनियम (RTI)",
        title: "जनसवाल (JanSawaal)",
        subtitle: "अपनी समस्या या सरकारी रिकॉर्ड की जानकारी बोलकर या लिखकर बताएं। हम पहले सार्वजनिक रिकॉर्ड खोजते हैं या सटीक आवेदन तैयार करते हैं।",
        cta: "समस्या दर्ज करें"
      };
    }
    return {
      badge: "Free Citizen Service • Right to Information (RTI)",
      title: "JanSawaal",
      subtitle: "Get answers from public records or prepare an official Right to Information request. Speak or type your problem in plain language.",
      cta: "Start Your Request"
    };
  };

  const text = getGreeting();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-8 sm:p-12 relative">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-blue-100">
          <span>{text.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {text.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          {text.subtitle}
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={onStart}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 text-base group"
          >
            <Mic className="w-5 h-5 text-blue-200" />
            <span>{text.cta}</span>
            <ArrowRight className="w-4 h-4 text-blue-200 ml-1" />
          </button>
        </div>

        {/* Guarantees Strip */}
        <div className="border-t border-slate-100 pt-8 mt-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Your Privacy & Protection
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <p className="text-xs font-bold text-slate-900">Your Privacy is Protected</p>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                We never ask for your Aadhaar, PAN card, or bank details.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <p className="text-xs font-bold text-slate-900">Instant Record Search</p>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                We check official public records first so you get answers immediately if already published.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <p className="text-xs font-bold text-slate-900">Official Format Ready</p>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                Converts questions into clear, numbered record requests that officers cannot easily reject.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <p className="text-xs font-bold text-slate-900">Direct Department Guidance</p>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                Guides you directly to the correct central, state, or municipal portal without wrong fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
