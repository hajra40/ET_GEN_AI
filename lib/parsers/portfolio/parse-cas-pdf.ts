import { extractTextFromDocumentBytes } from "@/lib/parsers/form16/extract-text";
import { parseCasText } from "@/lib/parsers/portfolio/parse-cas-text";

export function parseCasPdf(bytes: Uint8Array) {
  const text = extractTextFromDocumentBytes(bytes);
  return parseCasText(text);
}
