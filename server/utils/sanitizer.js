/**
 * RTI Online Text & Filename Sanitizer
 * Enforces RTI Online (rtionline.gov.in) rules:
 * 1. Strict <= 3,000 characters limit
 * 2. Allowed charset: A-Z a-z 0-9 , . - _ ( ) / @ : & ? \ % and whitespace (\s)
 * 3. File attachments & downloads: Strictly NO SPACES in filenames
 */

// Characters explicitly allowed on RTI Online portal text box:
// A-Za-z0-9 , . - _ ( ) / @ : & ? \ % and whitespace (\s)
export const RTI_ONLINE_ALLOWED_REGEX = /^[A-Za-z0-9,.\-_()/@:&?\\%\s]*$/;
export const RTI_ONLINE_DISALLOWED_REGEX = /[^A-Za-z0-9,.\-_()/@:&?\\%\s]/g;

/**
 * Sanitizes raw text into portal-safe format:
 * - Converts quotes, exclamations, semicolons into permitted punctuation
 * - Strips any non-allowed characters
 * - Normalizes excessive whitespace
 * - Truncates cleanly within maxLen (default 3000) at word boundaries
 */
export function sanitizeRtiText(rawText, maxLen = 3000) {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText
    // Replace smart quotes and regular quotes with empty space or commas
    .replace(/[\u201C\u201D"']/g, "")
    .replace(/[\u2018\u2019']/g, "")
    // Convert semicolons to commas, exclamations to periods
    .replace(/[;]/g, ",")
    .replace(/[!]/g, ".")
    // Convert em-dashes and en-dashes to standard hyphens
    .replace(/[\u2013\u2014]/g, "-")
    // Convert square or curly brackets to parentheses
    .replace(/[\[\{]/g, "(")
    .replace(/[\]\}]/g, ")")
    // Replace any remaining disallowed characters with blank
    .replace(RTI_ONLINE_DISALLOWED_REGEX, "");

  // Normalize duplicate spaces and tabs while keeping clean paragraphs
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  // Enforce strict character limit (<= 3000)
  if (text.length > maxLen) {
    text = text.slice(0, maxLen);
    // Rewind to last space or period so we do not chop a word in half
    const lastBoundary = Math.max(text.lastIndexOf(" "), text.lastIndexOf("."));
    if (lastBoundary > maxLen - 80) {
      text = text.slice(0, lastBoundary);
    }
    text = text.trim();
  }

  return text;
}

/**
 * Validates text against RTI Online specifications
 */
export function validateRtiCharset(text, maxLen = 3000) {
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

/**
 * Formats a clean, safe filename with strictly NO SPACES
 * Example: "RTI_Request_Ward12_Nalgonda_20261122.pdf"
 */
export function sanitizeFilename(name, extension = "pdf") {
  const ext = (extension || "pdf").replace(/^\./, "");
  if (!name) return `RTI_Document_${Date.now()}.${ext}`;
  
  // Strip extension from name if already present
  let baseName = name.replace(new RegExp(`\\.${ext}$`, "i"), "");

  // Replace spaces, special characters with underscores
  const clean = baseName
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${clean || "RTI_Document"}.${ext}`;
}
