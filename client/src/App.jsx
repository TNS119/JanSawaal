import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import QueryIntakeForm from "./components/QueryIntakeForm.jsx";
import VoiceClarification from "./components/VoiceClarification.jsx";
import DirectAnswerCard from "./components/DirectAnswerCard.jsx";
import ApplicantDetailsModal from "./components/ApplicantDetailsModal.jsx";
import DraftAndGuideView from "./components/DraftAndGuideView.jsx";
import TrackerDashboard from "./components/TrackerDashboard.jsx";
import DemoControlDrawer from "./components/DemoControlDrawer.jsx";
import { checkPublicRecords, draftRti } from "./utils/api.js";
import { speakText, stopSpeaking } from "./utils/tts.js";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  // Form State preserved across browser navigation
  const [query, setQuery] = useState("");
  const [issueLocation, setIssueLocation] = useState({
    state: "Telangana",
    district: "Nalgonda",
    ward: "Ward 12"
  });
  const [applicant, setApplicant] = useState({
    name: "Ramesh Kumar",
    address: "H.No 4-2-11, Ramagiri, Nalgonda, Telangana - 508001",
    phone: "9876543210",
    email: "ramesh.kumar@example.com",
    is_bpl: false
  });

  // Async & Processing States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [clarificationData, setClarificationData] = useState(null);
  const [directAnswerData, setDirectAnswerData] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);

  // SLA Tracker Cases in localStorage
  const [savedCases, setSavedCases] = useState(() => {
    try {
      const stored = localStorage.getItem("jansawaal_cases");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("jansawaal_cases", JSON.stringify(savedCases));
    } catch (e) {}
  }, [savedCases]);

  // Stop any active TTS audio whenever the route changes via browser back/forward buttons
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname]);

  // Step 1: Start Conversation / Welcome CTA
  const handleStartConversation = () => {
    navigate("/intake");
    // Warm conversational greeting in chosen language
    const greeting =
      language === "te"
        ? "నమస్కారం! మీకు కావాల్సిన ప్రభుత్వ రికార్డు లేదా సమస్య గురించి మాట్లాడండి లేదా రాయండి."
        : language === "hi"
        ? "नमस्ते! कृपया बताएं कि आपको किस सरकारी जानकारी या समस्या में सहायता चाहिए।"
        : "Hello! Tell me what government information or issue you need help with, and where the issue is located.";

    speakText(greeting, language);
  };

  // Step 2 & 4: Submit Query for Public Record Check
  const handleCheckRecords = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingStatus("Checking Section 4 Public Disclosures...");
    setClarificationData(null);
    stopSpeaking();

    try {
      const result = await checkPublicRecords(query, issueLocation, language);

      if (result.status === "FOUND_IN_RECORDS") {
        // Path A: Found in Public Records -> Direct Answer Route (0 Days)
        setDirectAnswerData(result);
        navigate("/direct-answer");
      } else if (result.status === "NEEDS_CLARIFICATION") {
        // Step 3: Smart Voice Follow-up
        setClarificationData(result);
      } else {
        // Path B: Not in public records -> Open Applicant Details Modal
        setIsApplicantModalOpen(true);
      }
    } catch (err) {
      console.error("Record check error:", err);
      setIsApplicantModalOpen(true);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  // Step 3: Clarification resolved
  const handleResolveClarification = (clarificationText) => {
    const updatedQuery = `${query.trim()}. Clarification: ${clarificationText}`;
    setQuery(updatedQuery);
    setClarificationData(null);
    setIsApplicantModalOpen(true);
  };

  // Step 5: Applicant Details Submitted -> Call /api/draft-rti -> Navigate to /draft
  const handleApplicantSubmit = async (applicantInfo) => {
    setApplicant(applicantInfo);
    setIsApplicantModalOpen(false);
    setIsLoading(true);
    setLoadingStatus("Formulating Section 6(1) Rejection-Proof Draft...");

    try {
      const draftResult = await draftRti(query, issueLocation, applicantInfo, language);
      setDraftData(draftResult);
      navigate("/draft");
    } catch (err) {
      console.error("Draft generation failed:", err);
      alert("Failed to generate RTI draft. Please check server status.");
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  // Step 7: Save to My Cases -> Navigate to /cases
  const handleSaveToCases = (draft) => {
    const newCase = {
      id: `CASE-${Date.now()}`,
      title: query.slice(0, 80),
      query,
      issueLocation,
      applicant,
      department_match: draft.department_match,
      recommended_track: draft.recommended_track,
      registrationNumber: `RTI/${issueLocation.district.toUpperCase().slice(0, 3)}/2026/${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      filedDate: new Date().toISOString().slice(0, 10),
      status: "IN_PROGRESS",
      daysElapsed: 1,
      breached: false
    };

    setSavedCases([newCase, ...savedCases]);
    navigate("/cases");
  };

  // Reset to intake form
  const handleReset = () => {
    setQuery("");
    setDirectAnswerData(null);
    setDraftData(null);
    setClarificationData(null);
    stopSpeaking();
    navigate("/intake");
  };

  // Demo Scenarios Handler (Navigates through routes cleanly)
  const handleSelectScenario = async (scenario) => {
    setIsDemoDrawerOpen(false);
    stopSpeaking();

    if (scenario === "A") {
      // Scenario A: BPL Fee Exemption (Path A - 0 Days)
      setIssueLocation({ state: "Telangana", district: "Nalgonda", ward: "" });
      const scenarioAQuery = "Do I have to pay an RTI fee if I have a BPL card?";
      setQuery(scenarioAQuery);
      setIsLoading(true);
      setLoadingStatus("Checking Section 4 Public Disclosures...");

      try {
        const result = await checkPublicRecords(scenarioAQuery, { state: "Telangana", district: "Nalgonda" }, language);
        setDirectAnswerData(result);
        navigate("/direct-answer");
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else if (scenario === "B") {
      // Scenario B: 48-Hour Urgent RTI (Hospital MRI Report)
      setIssueLocation({ state: "Telangana", district: "Nalgonda", ward: "" });
      const scenarioBQuery = "My father is admitted in Govt General Hospital, Nalgonda and needs his MRI report urgently to shift hospitals.";
      setQuery(scenarioBQuery);
      const demoApplicant = {
        name: "Ramesh Kumar",
        address: "H.No 4-2-11, Ramagiri, Nalgonda, Telangana - 508001",
        phone: "9876543210",
        is_bpl: false
      };
      setApplicant(demoApplicant);
      setIsLoading(true);
      setLoadingStatus("Analyzing Life & Liberty Urgency under Section 7(1)...");

      try {
        const draftResult = await draftRti(
          scenarioBQuery,
          { state: "Telangana", district: "Nalgonda", ward: "" },
          demoApplicant,
          language
        );
        setDraftData(draftResult);
        navigate("/draft");
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else if (scenario === "C") {
      // Scenario C: Ward 12 road work + State RTI + SLA Escalation
      const loc = { state: "Telangana", district: "Nalgonda", ward: "Ward 12" };
      setIssueLocation(loc);
      const scenarioCQuery = "Ward 12 road in Nalgonda was dug up 6 months ago; I want the sanctioned budget and contractor details.";
      setQuery(scenarioCQuery);
      const demoApplicant = {
        name: "Ramesh Kumar",
        address: "H.No 4-2-11, Ramagiri, Nalgonda - 508001",
        phone: "9876543210",
        is_bpl: false
      };
      setApplicant(demoApplicant);
      setIsLoading(true);
      setLoadingStatus("Formulating State RTI Draft...");

      try {
        const draftResult = await draftRti(scenarioCQuery, loc, demoApplicant, language);
        setDraftData(draftResult);
        navigate("/draft");
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* App Header with Browser History Navigation */}
      <Header
        language={language}
        setLanguage={setLanguage}
        toggleDemoDrawer={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
        isDemoDrawerOpen={isDemoDrawerOpen}
        savedCasesCount={savedCases.length}
      />

      {/* Demo Controls Drawer */}
      <DemoControlDrawer
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main Routed Content Area - Supported by Browser Back & Forward */}
      <main className="flex-1 pb-16">
        <Routes>
          {/* Welcome Screen Route */}
          <Route
            path="/"
            element={<WelcomeScreen onStart={handleStartConversation} language={language} />}
          />

          {/* Intake Form Route */}
          <Route
            path="/intake"
            element={
              <>
                <QueryIntakeForm
                  query={query}
                  setQuery={setQuery}
                  issueLocation={issueLocation}
                  setIssueLocation={setIssueLocation}
                  language={language}
                  setLanguage={setLanguage}
                  onSubmit={handleCheckRecords}
                  isLoading={isLoading}
                  loadingStatus={loadingStatus}
                />

                {/* Voice Clarification (If critical context missing) */}
                {clarificationData && (
                  <VoiceClarification
                    clarificationData={clarificationData}
                    language={language}
                    onResolveClarification={handleResolveClarification}
                  />
                )}
              </>
            }
          />

          {/* Path A: Direct Public Record Card Route */}
          <Route
            path="/direct-answer"
            element={
              directAnswerData ? (
                <DirectAnswerCard
                  recordData={directAnswerData}
                  language={language}
                  onProceedToFiling={() => setIsApplicantModalOpen(true)}
                  onReset={handleReset}
                />
              ) : (
                <Navigate to="/intake" replace />
              )
            }
          />

          {/* Path B: Rejection-Proof Draft & Filing Guide Route */}
          <Route
            path="/draft"
            element={
              draftData ? (
                <DraftAndGuideView
                  draftData={draftData}
                  issueLocation={issueLocation}
                  applicant={applicant}
                  language={language}
                  onSaveToCases={handleSaveToCases}
                  onReset={handleReset}
                />
              ) : (
                <Navigate to="/intake" replace />
              )
            }
          />

          {/* My Cases SLA Tracker Dashboard Route */}
          <Route
            path="/cases"
            element={
              <TrackerDashboard
                savedCases={savedCases}
                onUpdateCase={(updated) =>
                  setSavedCases(savedCases.map((c) => (c.id === updated.id ? updated : c)))
                }
                onDeleteCase={(id) => setSavedCases(savedCases.filter((c) => c.id !== id))}
                onNewRequest={handleReset}
              />
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Applicant Details Modal (Only shown for Path B filing) */}
      <ApplicantDetailsModal
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        onSubmit={handleApplicantSubmit}
        issueLocation={issueLocation}
        isLoading={isLoading}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-300">
            JanSawaal (Voice-First & Fast-Track RTI Engine) • Built for Indian Citizens & Legal Transparency
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Complies with Section 6(1), Section 7(1) Life & Liberty, and Section 19(1) of the RTI Act, 2005. Rooted in browser history.
          </p>
        </div>
      </footer>
    </div>
  );
}
