import type { ParsedForm16Data } from "@/lib/parsers/form16/parse-form16";
import type { ConfidenceBadge } from "@/lib/types";

export function assessForm16Confidence(parsed: ParsedForm16Data): ConfidenceBadge {
  const coreFields = [
    parsed.annualGrossSalary,
    parsed.basicSalary,
    parsed.hraReceived,
    parsed.section80c,
    parsed.tds
  ];
  const extractedCoreFields = coreFields.filter((value) => value != null).length;
  const extractedTotalFields = Object.values(parsed).filter((value) => value != null).length;
  const score = Math.min(95, extractedCoreFields * 18 + extractedTotalFields * 6);

  if (score >= 75) {
    return {
      label: "estimated",
      score,
      explanation: "Most core salary and deduction fields were found, but the values should still be reviewed before filing.",
      lastUpdated: new Date().toISOString()
    };
  }

  if (score >= 45) {
    return {
      label: "estimated",
      score,
      explanation: "Some useful fields were extracted, but manual confirmation is needed because coverage is partial.",
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    label: "demo",
    score: Math.max(score, 20),
    explanation: "Extraction coverage is low, so the app should fall back to demo-safe sample values or ask for correction.",
    lastUpdated: new Date().toISOString()
  };
}
