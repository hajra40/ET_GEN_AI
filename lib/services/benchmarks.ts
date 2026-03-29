import { getBenchmarkMapping } from "@/lib/config/benchmarks";
import { featureFlags } from "@/lib/config/feature-flags";

export async function getBenchmarkForCategory(category: string) {
  const mapping = getBenchmarkMapping(category);

  return {
    benchmarkName: mapping.benchmarkName,
    benchmarkReturn: mapping.fallbackReturn,
    status: featureFlags.enableBenchmarkSync ? "estimated" : "estimated",
    source: mapping.source
  } as const;
}
