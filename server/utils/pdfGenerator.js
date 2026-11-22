import PDFDocument from "pdfkit";
import { sanitizeFilename } from "./sanitizer.js";

/**
 * Builds an official legal PDF for RTI, Urgent RTI, First Appeal, or CPGRAMS Grievance.
 * Returns a Promise that resolves with a Buffer.
 */
export function generatePdfBuffer(type, data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        info: {
          Title: data.title || "RTI Application - Form 6(1)",
          Author: data.applicant?.name || "RTI Applicant",
          Subject: "Application under the Right to Information Act, 2005",
          Keywords: "RTI, Section 6(1), India, Legal Draft"
        }
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const isUrgent = type === "URGENT_48HR" || data.recommended_track === "URGENT_48HR";
      const isAppeal = type === "FIRST_APPEAL";
      const isCpgrams = type === "CPGRAMS";

      // --- Header Banner ---
      doc.fontSize(16).font("Helvetica-Bold").text("GOVERNMENT CIVIC & LEGAL RECORDS PORTAL", { align: "center" });
      doc.moveDown(0.2);

      let subheader = "APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005";
      if (isAppeal) {
        subheader = "FIRST APPEAL MEMORANDUM UNDER SECTION 19(1) OF THE RTI ACT, 2005";
      } else if (isCpgrams) {
        subheader = "OFFICIAL CIVIC GRIEVANCE PETITION (CPGRAMS / STATE PORTAL)";
      }

      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e3a8a").text(subheader, { align: "center" });
      doc.moveDown(0.5);

      // --- Fast-Track Urgent Banner (If applicable) ---
      if (isUrgent) {
        doc.rect(50, doc.y, 495, 26).fillAndStroke("#fee2e2", "#dc2626");
        doc.fillColor("#991b1b").fontSize(10).font("Helvetica-Bold")
           .text("PRIORITY MATTER: CONCERNS LIFE & LIBERTY UNDER SECTION 7(1) - 48 HOUR STATUTORY DEADLINE", 60, doc.y - 19, { align: "center" });
        doc.moveDown(0.8);
      }

      doc.fillColor("#111827"); // reset text color

      // Divider line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbd5e1").lineWidth(1).stroke();
      doc.moveDown(0.8);

      // --- Metadata Table / Date & Location ---
      const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const district = data.issueLocation?.district || "Nalgonda";
      const state = data.issueLocation?.state || "Telangana";

      doc.fontSize(9).font("Helvetica").text(`Place: ${district}, ${state}`, { continued: true });
      doc.text(`Date: ${currentDate}`, { align: "right" });
      doc.moveDown(0.6);

      // --- Recipient Block ---
      doc.font("Helvetica-Bold").fontSize(10).text("TO:");
      doc.font("Helvetica").fontSize(10);

      if (isAppeal) {
        doc.text(data.faa_recipient || "The First Appellate Authority (FAA)");
        doc.text(data.department_match?.name || "Concerned Public Authority");
        doc.text(`${district}, ${state}`);
      } else {
        const officerTitle = data.department_match?.officer || "The Public Information Officer (PIO)";
        const deptName = data.department_match?.name || "Concerned Department";
        doc.text(officerTitle);
        doc.text(deptName);
        doc.text(`${district}, ${state}`);
      }
      doc.moveDown(0.8);

      // --- Applicant Block ---
      doc.font("Helvetica-Bold").fontSize(10).text("APPLICANT DETAILS:");
      doc.font("Helvetica").fontSize(9);
      const appName = data.applicant?.name || "Ramesh Kumar";
      const appAddress = data.applicant?.address || `H.No 4-2-11, ${district}, ${state}`;
      const appPhone = data.applicant?.phone || "Not Disclosed";
      const isBpl = Boolean(data.applicant?.is_bpl);

      doc.text(`Name: ${appName}`);
      doc.text(`Postal Address: ${appAddress}`);
      doc.text(`Contact: ${appPhone}`);
      doc.text(`Category: ${isBpl ? "Below Poverty Line (BPL) - Fee Exempt under Sec 7(5)" : "General Citizen"}`);
      doc.moveDown(0.8);

      // --- Subject ---
      doc.font("Helvetica-Bold").fontSize(10);
      let subjectText = `Application for certified records under Section 6(1) regarding: ${data.query?.slice(0, 80) || "Civic works and public expenditure"}`;
      if (isAppeal) {
        subjectText = `First Appeal under Section 19(1) against deemed refusal / failure of PIO to supply information within statutory SLA.`;
      } else if (isUrgent) {
        subjectText = `URGENT Application under Section 7(1) seeking immediate certified medical/safety records concerning Life & Liberty.`;
      }
      doc.text(`SUBJECT: ${subjectText}`);
      doc.moveDown(0.8);

      // --- Salutation & Body Preamble ---
      doc.font("Helvetica").fontSize(9.5);
      doc.text("Respected Sir/Madam,");
      doc.moveDown(0.3);

      if (isAppeal) {
        doc.text("Being aggrieved by the non-response / deemed refusal of the Public Information Officer within the mandatory 30-day statutory period, I prefer this First Appeal under Section 19(1) of the RTI Act, 2005 on the following grounds:");
        doc.moveDown(0.5);
        
        doc.font("Helvetica-Bold").text("GROUNDS OF APPEAL:");
        doc.font("Helvetica");
        doc.text("1. The applicant submitted an RTI request under Section 6(1) on " + (data.filingDate || "the statutory date") + ".");
        doc.text("2. More than 30 days have elapsed, and the PIO has failed to provide any information or statutory notice of transfer.");
        doc.text("3. Under Section 7(2) of the Act, such failure constitutes a deemed refusal.");
        doc.text("4. As per Section 7(6), where a public authority fails to give information within the specified period, the information shall be provided free of charge.");
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").text("PRAYER / RELIEF SOUGHT:");
        doc.font("Helvetica");
        doc.text("The appellant prays that the First Appellate Authority may be pleased to direct the PIO to immediately furnish the certified records free of cost as mandated by Section 7(6) and recommend penal action under Section 20 for unjustified delay.");
      } else {
        if (isUrgent) {
          doc.text("The applicant hereby requests certified records and official information under Section 6(1) read with the proviso to Section 7(1) of the Right to Information Act, 2005. Because this matter concerns life, liberty, and urgent healthcare management, it is legally mandated to be provided within forty-eight (48) hours of receipt.");
        } else {
          doc.text("The applicant, being an Indian citizen, hereby requests certified records and official copies under Section 6(1) and Section 2(j) of the Right to Information Act, 2005 pertaining to the following particulars:");
        }
        doc.moveDown(0.6);

        // --- Numbered Questions ---
        doc.font("Helvetica-Bold").fontSize(10).text("PARTICULARS OF INFORMATION SOUGHT:");
        doc.font("Helvetica").fontSize(9.5);

        const questions = Array.isArray(data.reframed_questions) && data.reframed_questions.length > 0
          ? data.reframed_questions
          : [
              "1. Provide certified copy of the administrative sanction, work order, and allocated budget.",
              "2. Provide name and official details of the designated contractor/officer.",
              "3. Provide current status, completion timeline, and inspection measurements recorded on site."
            ];

        questions.forEach((q) => {
          doc.text(q, { indent: 10 });
          doc.moveDown(0.2);
        });
      }
      doc.moveDown(0.8);

      // --- Fee & Statutory Section ---
      doc.font("Helvetica-Bold").fontSize(9.5).text("STATUTORY FEE DECLARATION:");
      doc.font("Helvetica").fontSize(9);
      if (isAppeal) {
        doc.text("No fee is payable for preferring a First Appeal under the Central / State RTI Rules.");
      } else if (isBpl) {
        doc.text("The applicant belongs to the Below Poverty Line (BPL) category and is completely exempt from paying application fees and copying charges under Section 7(5) of the RTI Act. Proof of valid BPL / Food Security Card is attached.");
      } else {
        doc.text("Statutory application fee of Rs. 10/- has been remitted via Online Portal Payment / Indian Postal Order / Court Fee Stamp.");
      }
      doc.moveDown(0.6);

      // --- Verification & Declaration ---
      doc.font("Helvetica-Bold").fontSize(9.5).text("DECLARATION (SECTION 3):");
      doc.font("Helvetica").fontSize(8.5);
      doc.text("I hereby state and declare that I am a citizen of India and that the information sought does not fall within the exemptions contained in Section 8 or 9 of the Right to Information Act, 2005.");
      doc.moveDown(1.2);

      // --- Signature Block ---
      doc.fontSize(9.5).font("Helvetica-Bold").text("Yours faithfully,", { align: "right" });
      doc.moveDown(1.5);
      doc.font("Helvetica").text(`(${appName})`, { align: "right" });
      doc.text("Applicant / Citizen of India", { align: "right" });

      // Footer
      doc.fontSize(7.5).fillColor("#64748b").text(
        "Generated via JanSawaal (Voice-First & Fast-Track RTI Engine) - Certified Portal-Safe & Section 6(1) Compliant",
        50,
        780,
        { align: "center", width: 495 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
