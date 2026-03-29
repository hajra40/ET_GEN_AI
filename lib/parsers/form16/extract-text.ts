function extractPdfTextLiterals(rawText: string) {
  const matches = Array.from(rawText.matchAll(/\(([^()]*)\)\s*Tj/g)).map((match) => match[1]);
  const tjMatches: string[] = [];
  const blockPattern = /\[([\s\S]*?)\]\s*TJ/g;

  for (const match of rawText.matchAll(blockPattern)) {
    tjMatches.push(
      ...Array.from((match[1] ?? "").matchAll(/\(([^()]*)\)/g)).map((part) => part[1])
    );
  }

  return [...matches, ...tjMatches].join("\n");
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function extractTextFromDocumentBytes(bytes: Uint8Array) {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const latin1 = new TextDecoder("latin1", { fatal: false }).decode(bytes);
  const extractedLiteralText = extractPdfTextLiterals(latin1);
  const bestCandidate =
    extractedLiteralText.length > 200
      ? extractedLiteralText
      : utf8.length > latin1.length
        ? utf8
        : latin1;

  return cleanExtractedText(bestCandidate);
}
