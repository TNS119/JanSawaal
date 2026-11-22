import React, { useState } from "react";
import {
  Clock,
  Download,
  Copy,
  Check,
  Trash2,
  PlusCircle,
  AlertTriangle
} from "lucide-react";
import { draftAppeal, downloadPdf } from "../utils/api.js";

export default function TrackerDashboard({
  savedCases,
  onUpdateCase,
  onDeleteCase,
  onNewRequest
}) {
  const [activeAppealCaseId, setActiveAppealCaseId] = useState(null);
  const [appealData, setAppealData] = useState(null);
  const [isLoadingAppeal, setIsLoadingAppeal] = useState(false);
  const [copiedAppeal, setCopiedAppeal] = useState(false);

  // Trigger "Simulate No Reply" demo
  const handleSimulateBreach = async (caseItem) => {
    const updatedCase = {
      ...caseItem,
      status: "OVERDUE",
      daysElapsed: 31,
      breached: true
    };
    onUpdateCase(updatedCase);

    setIsLoadingAppeal(true);
    setActiveAppealCaseId(caseItem.id);

    try {
      const appealResult = await draftAppeal({
        caseId: caseItem.id,
        originalSubject: caseItem.title || "Public Records Request",
        registrationNumber: caseItem.registrationNumber || "RTI/NMC/2026/00142",
        department_match: caseItem.department_match,
        applicant: caseItem.applicant,
        issueLocation: caseItem.issueLocation,
        filingDate: caseItem.filedDate || "31 days ago",
        ground: "NO_RESPONSE"
      });

      setAppealData(appealResult);
    } catch (err) {
      console.error("Error creating appeal:", err);
      alert("Failed to draft appeal. Please try again.");
    } finally {
      setIsLoadingAppeal(false);
    }
  };

  const handleDownloadAppealPdf = async (caseItem) => {
    if (!appealData) return;
    try {
      await downloadPdf("FIRST_APPEAL", {
        ...appealData,
        applicant: caseItem.applicant,
        issueLocation: caseItem.issueLocation
      });
    } catch (err) {
      console.error("Failed to download appeal PDF:", err);
      alert("Could not download appeal PDF.");
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Applications & Status Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Track official response deadlines (48 Hours for urgent matters, 30 Days for standard requests).
          </p>
        </div>

        <button
          onClick={onNewRequest}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center space-x-2 shrink-0 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Cases List */}
      {savedCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Saved Applications Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            When you create an application, click "Save & Track Status" to monitor response timelines here.
          </p>
          <button
            onClick={onNewRequest}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
          >
            Create Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedCases.map((item) => {
            const isUrgent = item.recommended_track === "URGENT_48HR";
            const isOverdue = item.status === "OVERDUE" || item.breached;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isOverdue ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
                }`}
              >
                <div className="p-5 sm:p-6">
                  {/* Case Head */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                        {item.registrationNumber || "RTI-2026-001"}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          isOverdue
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : isUrgent
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isOverdue
                          ? "No Reply (Overdue)"
                          : isUrgent
                          ? "48-Hour Urgent Window"
                          : "Awaiting Reply (30 Days)"}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteCase(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Dept */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    {item.title || item.query?.slice(0, 90) || "Civic Record Request"}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Department:{" "}
                    <span className="font-semibold text-slate-700">
                      {item.department_match?.name || "Local Municipal Authority"}
                    </span>{" "}
                    • Filed on {item.filedDate || "2026-10-20"}
                  </p>

                  {/* Countdown Timer Strip */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Response Timeline
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Clock
                            className={`w-4 h-4 ${
                              isOverdue ? "text-red-600" : "text-blue-600"
                            }`}
                          />
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              isOverdue ? "text-red-700" : "text-slate-900"
                            }`}
                          >
                            {isOverdue
                              ? "30-Day Statutory Deadline Passed (No Reply)"
                              : isUrgent
                              ? "34 Hours Remaining of 48-Hour Window"
                              : "18 Days Remaining of 30-Day Window"}
                          </span>
                        </div>
                      </div>

                      {/* Demo Action */}
                      {!isOverdue ? (
                        <button
                          onClick={() => handleSimulateBreach(item)}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Simulate No Reply (After 30 Days)</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                          <span>30 Days Elapsed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Overdue Alert */}
                  {isOverdue && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-red-900 uppercase">
                            Eligible for Free Information Under RTI Rules
                          </h4>
                          <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                            Because 30 days have elapsed without a response from the officer, you are legally entitled to receive all information free of cost. You can now file a First Appeal at ₹0 fee.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render First Appeal Panel when Breach Simulated */}
                  {isOverdue && activeAppealCaseId === item.id && appealData && (
                    <div className="bg-slate-900 text-white rounded-xl p-5 mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          First Appeal Application Ready
                        </span>

                        <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          ₹0 Fee
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">
                        {appealData.appeal_title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {appealData.legal_grounds}
                      </p>

                      <textarea
                        readOnly
                        rows={6}
                        value={appealData.portal_safe_text}
                        className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-lg border border-slate-800"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(appealData.portal_safe_text);
                            setCopiedAppeal(true);
                            setTimeout(() => setCopiedAppeal(false), 2000);
                          }}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                        >
                          {copiedAppeal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAppeal ? "Copied!" : "Copy Text"}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadAppealPdf(item)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Appeal PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
