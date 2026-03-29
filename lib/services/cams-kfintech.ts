export function identifyStatementSource(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("cams")) {
    return "CAMS";
  }

  if (normalized.includes("kfin") || normalized.includes("kfintech")) {
    return "KFintech";
  }

  return "Unknown";
}
