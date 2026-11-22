import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  BookmarkPlus,
  CheckCircle2
} from "lucide-react";
import PortalFilingGuide from "./PortalFilingGuide.jsx";
import { downloadPdf } from "../utils/api.js";
import { speakText, stopSpeaking } from "../utils/tts.js";

export default function DraftAndGuideView({
  draftData,
  issueLocation,
  applicant,
  language,
  onSaveToCases
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isUrgent = draftData.recommended_track === "URGENT_48HR";
  const isState = draftData.jurisdiction === "STATE";

  const handleCopy = () => {
    navigator.clipboard.writeText(draftData.portal_safe_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadPdf(draftData.recommended_track || "RTI", {
        ...draftData,
        issueLocation,
        applicant
      });
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToRead =
        draftData.native_summary ||
        `Your RTI application is ready. We have prepared official record requests for you.`;
      speakText(
        textToRead,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div
          className={`p-6 sm:p-8 text-white ${
            isUrgent
              ? "bg-gradient-to-r from-red-600 to-rose-700"
              : "bg-gradient-to-r from-blue-800 to-indigo-900"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/30">
              {isUrgent
                ? "48-Hour Urgent Request (Life & Medical Care)"
                : "Standard 30-Day RTI Application"}
            </span>

            {/* Readback voice button */}
            <button
              onClick={toggleVoice}
              className="flex items-center space-x-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-all border border-white/30"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? "Pause Audio" : "Listen to Summary"}</span>
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your RTI Application is Ready
          </h2>
          <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-2xl">
            {draftData.native_summary ||
              "Your query has been structured into formal certified record requests."}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Jurisdiction Note */}
          {isState && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase">
                    Important: State / Local Matter
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                    {draftData.jurisdiction_warning ||
                      "This issue falls under State/Municipal jurisdiction. Please submit it through the state portal or by post to the local office rather than the central RTI portal."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Department & Fee Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Concerned Department & Officer
              </span>
              <p className="text-sm font-bold text-slate-900">
                {draftData.department_match?.name || "Concerned Department"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {draftData.department_match?.officer || "Public Information Officer (PIO)"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Application Fee
              </span>
              <p className="text-sm font-bold text-slate-900">
                {draftData.fee_calculation?.amount_inr === 0
                  ? "₹0 (Free - BPL Card Holder)"
                  : `₹${draftData.fee_calculation?.amount_inr || 10} Standard Application Fee`}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {draftData.fee_calculation?.note || "Pay via online portal or Postal Order."}
              </p>
            </div>
          </div>

          {/* Quality Checklist */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Application Quality Checks
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-white p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Formal Record Request</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-white p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Public Interest Approved</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-white p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{draftData.char_count || 0} / 3000 Characters</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-white p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Portal Ready</span>
              </div>
            </div>
          </div>

          {/* Reframed Questions */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Specific Information Requested:
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              {draftData.reframed_questions?.map((q, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-800">
                  <span className="font-bold text-blue-700 shrink-0">•</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Application Text (Copy and paste into portal)
              </label>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500">
                  {draftData.char_count} / 3000 chars
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={8}
              value={draftData.portal_safe_text}
              className="w-full bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800 leading-relaxed"
            />
          </div>

          {/* Download & Save Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-6">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Preparing PDF..." : "Download PDF"}</span>
            </button>

            <button
              onClick={() => onSaveToCases(draftData)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm shadow flex items-center justify-center space-x-2 transition-all"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save & Track Status</span>
            </button>
          </div>

          {/* Interactive Step-by-Step Filing Guide */}
          <PortalFilingGuide
            jurisdiction={draftData.jurisdiction}
            departmentName={draftData.department_match?.name}
            portalUrl={draftData.department_match?.portal_url}
            isBpl={Boolean(applicant?.is_bpl)}
            steps={draftData.filing_guide_steps}
          />
        </div>
      </div>
    </div>
  );
}
