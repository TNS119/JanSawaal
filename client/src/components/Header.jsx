import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, BookOpen, Clock, PlayCircle, Globe, Volume2 } from "lucide-react";

export default function Header({
  language,
  setLanguage,
  savedCasesCount = 0
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCasesTab = location.pathname === "/cases";

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title -> Navigates to home ("/") via browser router */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
            title="JanSawaal Home"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              JS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">JanSawaal</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                  Voice-First & Fast-Track
                </span>
              </div>
              <p className="text-xs text-slate-400">Voice-First Citizen Record Access</p>
            </div>
          </div>

          {/* Navigation Links rooted in browser history */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate("/intake")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !isCasesTab
                  ? "bg-blue-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              New Request
            </button>
            <button
              onClick={() => navigate("/cases")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isCasesTab
                  ? "bg-blue-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Track Applications</span>
              {savedCasesCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.2 rounded-full font-bold">
                  {savedCasesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right actions: Language Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === "en" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("te")}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === "te" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                }`}
                title="Telugu"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === "hi" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                }`}
                title="Hindi"
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
