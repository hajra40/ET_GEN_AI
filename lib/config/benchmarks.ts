import type { SourceMeta } from "@/lib/types";

export interface BenchmarkMapping {
  benchmarkName: string;
  matchers: string[];
  fallbackReturn: number;
  source: SourceMeta;
}

const nseSource = {
  id: "nse-index-history",
  label: "NSE index history",
  provider: "NSE",
  kind: "official" as const,
  url: "https://www.nseindia.com/reports-indices-historical-index-data",
  note: "Use live history when enabled; otherwise show category-mapped fallback estimates."
};

export const benchmarkMappings: BenchmarkMapping[] = [
  {
    benchmarkName: "NIFTY 50 TRI",
    matchers: ["large cap", "index", "flexi", "multicap", "equity"],
    fallbackReturn: 11.5,
    source: nseSource
  },
  {
    benchmarkName: "NIFTY Midcap 150 TRI",
    matchers: ["mid cap", "midcap"],
    fallbackReturn: 13,
    source: nseSource
  },
  {
    benchmarkName: "NIFTY Smallcap 250 TRI",
    matchers: ["small cap", "smallcap"],
    fallbackReturn: 14,
    source: nseSource
  },
  {
    benchmarkName: "NIFTY 50 Hybrid Composite Debt 50:50",
    matchers: ["hybrid", "balanced", "asset allocation", "aggressive hybrid"],
    fallbackReturn: 9.5,
    source: nseSource
  },
  {
    benchmarkName: "NIFTY Composite Debt Index",
    matchers: ["debt", "liquid", "corporate bond", "gilt", "short duration"],
    fallbackReturn: 7,
    source: nseSource
  },
  {
    benchmarkName: "Domestic Gold Price Proxy",
    matchers: ["gold"],
    fallbackReturn: 8,
    source: {
      ...nseSource,
      id: "gold-proxy",
      label: "Gold proxy benchmark",
      provider: "Internal mapping"
    }
  }
];

export function getBenchmarkMapping(category: string) {
  const normalized = category.trim().toLowerCase();

  return (
    benchmarkMappings.find((mapping) =>
      mapping.matchers.some((matcher) => normalized.includes(matcher))
    ) ?? benchmarkMappings[0]
  );
}
