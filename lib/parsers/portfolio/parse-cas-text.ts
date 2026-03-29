import type { ConfidenceBadge, PortfolioFund } from "@/lib/types";

function toNumber(raw: string | undefined) {
  const value = Number((raw ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export function parseCasText(text: string): { funds: PortfolioFund[]; confidence: ConfidenceBadge } {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const funds: PortfolioFund[] = [];

  for (const line of lines) {
    const match = line.match(
      /([A-Za-z0-9 .&\-]+?)\s+([A-Za-z ]+)?\s+([0-9,]+(?:\.\d+)?)\s+([0-9,]+(?:\.\d+)?)/i
    );

    if (!match) {
      continue;
    }

    funds.push({
      fundName: match[1].trim(),
      category: match[2]?.trim() || "Unclassified",
      investedAmount: toNumber(match[3]),
      currentValue: toNumber(match[4]),
      expenseRatio: 0,
      benchmarkReturn: 0,
      annualizedReturn: 0,
      styleTags: [],
      topHoldings: []
    });
  }

  return {
    funds,
    confidence: {
      label: funds.length > 0 ? "estimated" : "unavailable",
      score: funds.length > 0 ? 60 : 10,
      explanation:
        funds.length > 0
          ? "Statement text was extracted and partially mapped, but holdings and transaction history may still be incomplete."
          : "No portfolio rows could be confidently identified in the extracted statement text.",
      lastUpdated: new Date().toISOString()
    }
  };
}
