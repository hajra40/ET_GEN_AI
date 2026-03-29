import { benchmarkMappings } from "@/lib/config/benchmarks";
import { featureFlags } from "@/lib/config/feature-flags";
import { getCachedValue, setCachedValue } from "@/lib/services/cache";
import { fetchText } from "@/lib/services/http";
import type { SourceMeta } from "@/lib/types";

export interface AmfiNavRecord {
  schemeCode: string;
  schemeName: string;
  nav: number;
  navDate: string;
  source: SourceMeta;
}

const AMFI_CACHE_TTL = 1000 * 60 * 60 * 12;

export function normalizeSchemeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\bdirect\b|\bgrowth\b|\bregular\b|\bplan\b|\boption\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAmfiNavDump() {
  const cacheKey = "amfi-nav-dump";
  const cached = getCachedValue<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const text = await fetchText(`${featureFlags.amfiNavBaseUrl}/spages/NAVAll.txt`, {
    timeoutMs: 7000,
    retries: 1
  });
  setCachedValue(cacheKey, text, AMFI_CACHE_TTL);
  return text;
}

export async function fetchLatestNavBySchemeCode(schemeCode?: string) {
  if (!schemeCode || !featureFlags.enableAmfiSync) {
    return null;
  }

  try {
    const dump = await getAmfiNavDump();
    const match = dump
      .split(/\r?\n/)
      .map((line) => line.split(";"))
      .find((parts) => parts[0]?.trim() === schemeCode.trim());

    if (!match) {
      return null;
    }

    return {
      schemeCode: match[0]?.trim() ?? schemeCode,
      schemeName: match[3]?.trim() ?? "",
      nav: Number(match[4] ?? 0),
      navDate: match[5]?.trim() ?? "",
      source: {
        id: "amfi-nav",
        label: "AMFI latest NAV",
        provider: "AMFI",
        kind: "official",
        url: "https://www.amfiindia.com/net-asset-value/nav-download",
        asOf: match[5]?.trim() ?? "",
        freshnessLabel: "Official NAV dump"
      }
    } satisfies AmfiNavRecord;
  } catch {
    return null;
  }
}

export function inferBenchmarkFromSchemeName(name: string) {
  const normalized = normalizeSchemeName(name);

  return (
    benchmarkMappings.find((mapping) =>
      mapping.matchers.some((matcher) => normalized.includes(matcher.replace(/\s+/g, "")))
    ) ?? benchmarkMappings[0]
  );
}
