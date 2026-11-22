import React from "react";
import { ExternalLink } from "lucide-react";

export default function PortalFilingGuide({
  jurisdiction = "STATE",
  departmentName = "Concerned Department",
  portalUrl = "https://rtionline.gov.in/",
  isBpl = false,
  steps = []
}) {
  const isCentral = jurisdiction === "CENTRAL";

  // Clean URL and extract domain name for clear display
  let domain = "Government Portal";
  try {
    if (portalUrl) {
      domain = new URL(portalUrl).hostname.replace("www.", "");
    }
  } catch (e) {
    domain = portalUrl;
  }

  const defaultSteps = isCentral
    ? [
        "1. Open the Central RTI Portal: https://rtionline.gov.in/ and click 'Submit Request'.",
        "2. Read the instructions, accept the declaration, and continue.",
        `3. Select the department: Search for '${departmentName}'.`,
        "4. Paste the copied text into the application text field.",
        isBpl
          ? "5. Select 'Below Poverty Line -> Yes' and attach a copy of your BPL card (file must not have spaces in the name)."
          : "5. Pay the standard Rs. 10 fee using UPI, Debit Card, or Net Banking.",
        "6. Save the registration number shown on screen to track your application."
      ]
    : [
        `1. Open the official department portal (${portalUrl || "State Municipal Services"}) or prepare to send by Registered Post to the PIO.`,
        `2. Select Department: '${departmentName}'.`,
        "3. Paste the application text into the online form or print the downloaded PDF.",
        isBpl
          ? "4. Attach your BPL / Food Security card for fee exemption."
          : "4. Pay the Rs. 10 application fee online (or attach Rs. 10 court fee stamp / postal order for physical post).",
        "5. Save your reference or postal tracking number."
      ];

  const guideSteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Filing Instructions & Next Steps
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow these steps to submit your application online or by post.
          </p>
        </div>

        {portalUrl && (
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <span>Go to {domain}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="space-y-2.5">
        {guideSteps.map((step, idx) => (
          <div key={idx} className="flex items-start space-x-3 bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {step.replace(/^\d+\.\s*/, "")}
            </p>
          </div>
        ))}
      </div>

      {/* Helpful file attachment tip */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <span className="font-bold">File attachment tip:</span> Government portals reject attachments if the filename contains spaces. The PDF downloaded from JanSawaal is already formatted with zero spaces so it uploads without errors.
      </div>
    </div>
  );
}
