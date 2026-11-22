/**
 * API client helper functions for RTI-Draft
 */

export async function checkPublicRecords(query, issueLocation, language = "en") {
  const res = await fetch("/api/check-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, issueLocation, language })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to check public records");
  }
  return res.json();
}

export async function draftRti(query, issueLocation, applicant, language = "en") {
  const res = await fetch("/api/draft-rti", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, issueLocation, applicant, language })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to generate RTI draft");
  }
  return res.json();
}

export async function draftAppeal(appealPayload) {
  const res = await fetch("/api/draft-appeal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appealPayload)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to draft First Appeal");
  }
  return res.json();
}

export async function transcribeAudio(audioBlob, language = "auto") {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("language", language);

  const res = await fetch("/api/transcribe", {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Audio transcription failed");
  }
  return res.json();
}

export async function downloadPdf(type, draftData) {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, draftData })
  });

  if (!res.ok) {
    throw new Error("PDF generation failed on server");
  }

  // Get filename from header or fallback
  let filename = "RTI_Draft_Document.pdf";
  const disposition = res.headers.get("Content-Disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
