import React from "react";
import { PlayCircle, X, CheckCircle, Clock, FileWarning, ArrowRight } from "lucide-react";

export default function DemoControlDrawer({
  isOpen,
  onClose,
  onSelectScenario
}) {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-900 border-b border-amber-500/30 text-white p-4 sm:p-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-amber-300 uppercase tracking-wide">
              Judge Evaluation Scenarios (1-Click Test Harness)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario A */}
          <div
            onClick={() => onSelectScenario("A")}
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 p-4 rounded-xl cursor-pointer transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SCENARIO A • 0-DAY INSTANT ANSWER
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              BPL RTI Fee Exemption Lookup
            </h4>
            <p className="text-xs text-slate-400 leading-snug mb-3">
              "Do I have to pay an RTI fee if I have a BPL card?"
            </p>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Verifies Path A: Skips personal form, gives direct 0-day rule.</span>
            </div>
          </div>

          {/* Scenario B */}
          <div
            onClick={() => onSelectScenario("B")}
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/60 p-4 rounded-xl cursor-pointer transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SCENARIO B • 48-HR URGENT RTI
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Hospital MRI Records (Life & Liberty)
            </h4>
            <p className="text-xs text-slate-400 leading-snug mb-3">
              "Father in GGH Nalgonda needs MRI urgently to shift hospitals."
            </p>
            <div className="text-[11px] text-rose-400 font-medium flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Invokes Section 7(1), 48-Hr deadline & Hospital PIO guide.</span>
            </div>
          </div>

          {/* Scenario C */}
          <div
            onClick={() => onSelectScenario("C")}
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/60 p-4 rounded-xl cursor-pointer transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SCENARIO C • STATE RTI & FIRST APPEAL
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Ward 12 Road Work + SLA Escalation
            </h4>
            <p className="text-xs text-slate-400 leading-snug mb-3">
              "Ward 12 road dug up 6 months ago; want contractor & budget."
            </p>
            <div className="text-[11px] text-blue-400 font-medium flex items-center space-x-1">
              <FileWarning className="w-3.5 h-3.5 shrink-0" />
              <span>Warns on State jurisdiction, saves case, unlocks First Appeal.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
