/**
 * Client-Side RTI Online Sanitizer & Validator
 */

export const RTI_ONLINE_DISALLOWED_REGEX = /[^A-Za-z0-9,.\-_()/@:&?\\%\s]/g;

export function sanitizeRtiTextClient(rawText, maxLen = 3000) {
  if (!rawText) return "";

  let text = rawText
    .replace(/[\u201C\u201D"']/g, "")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[;]/g, ",")
    .replace(/[!]/g, ".")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\[\{]/g, "(")
    .replace(/[\]\}]/g, ")")
    .replace(RTI_ONLINE_DISALLOWED_REGEX, "");

  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  if (text.length > maxLen) {
    text = text.slice(0, maxLen);
    const lastBoundary = Math.max(text.lastIndexOf(" "), text.lastIndexOf("."));
    if (lastBoundary > maxLen - 80) {
      text = text.slice(0, lastBoundary);
    }
    text = text.trim();
  }

  return text;
}

export function validateRtiCharsetClient(text, maxLen = 3000) {
  if (!text) return { isValid: true, length: 0, invalidChars: [] };

  const matches = text.match(RTI_ONLINE_DISALLOWED_REGEX) || [];
  const uniqueInvalid = Array.from(new Set(matches));

  return {
    isValid: uniqueInvalid.length === 0 && text.length <= maxLen,
    length: text.length,
    isWithinLimit: text.length <= maxLen,
    hasOnlyAllowedChars: uniqueInvalid.length === 0,
    invalidChars: uniqueInvalid
  };
}

export function sanitizeFilename(name, extension = "pdf") {
  const ext = (extension || "pdf").replace(/^\./, "");
  if (!name) return `RTI_Document_${Date.now()}.${ext}`;
  
  let baseName = name.replace(new RegExp(`\\.${ext}$`, "i"), "");

  const clean = baseName
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${clean || "RTI_Document"}.${ext}`;
}
