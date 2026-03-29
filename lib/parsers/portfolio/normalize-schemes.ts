import { normalizeSchemeName } from "@/lib/services/amfi";

export function normalizePortfolioSchemeName(name: string) {
  return normalizeSchemeName(name);
}
