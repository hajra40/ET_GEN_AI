function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export const featureFlags = {
  amfiNavBaseUrl: process.env.AMFI_NAV_BASE_URL ?? "https://www.amfiindia.com",
  nseDataBaseUrl: process.env.NSE_DATA_BASE_URL ?? "https://www.nseindia.com",
  enableAmfiSync: parseBoolean(process.env.ENABLE_AMFI_SYNC, false),
  enableBenchmarkSync: parseBoolean(process.env.ENABLE_BENCHMARK_SYNC, false),
  enableRealUploadParsing: parseBoolean(process.env.ENABLE_REAL_UPLOAD_PARSING, true),
  enableGeminiSummaries: parseBoolean(process.env.ENABLE_GEMINI_SUMMARIES, true)
} as const;
