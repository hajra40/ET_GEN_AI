import type {
  PortfolioFund,
  PortfolioXRayResult
} from "@/lib/types";
import { getAssumptionsForModule } from "@/lib/config/finance-assumptions";
import { getBenchmarkMapping } from "@/lib/config/benchmarks";
import { calculateFundOverlap } from "@/lib/calculators/holdings-overlap";
import { calculateXirrFromTransactions } from "@/lib/calculators/xirr";
import { parsePortfolioCsvText } from "@/lib/parsers/portfolio/parse-csv";
import { round, sum } from "@/lib/utils";

export function calculatePortfolioXRay(funds: PortfolioFund[]): PortfolioXRayResult {
  const assumptionsUsed = getAssumptionsForModule("portfolio");
  const totalValue = sum(funds.map((fund) => fund.currentValue));
  const totalInvested = sum(funds.map((fund) => fund.investedAmount));
  const allocationMap = new Map<string, number>();

  funds.forEach((fund) => {
    allocationMap.set(fund.category, (allocationMap.get(fund.category) ?? 0) + fund.currentValue);
  });

  const assetAllocation = Array.from(allocationMap.entries())
    .map(([category, value]) => ({ category, value: round(value) }))
    .sort((left, right) => right.value - left.value);

  const fundOverlap = calculateFundOverlap(funds);
  const weightedExpenseRatio = sum(
    funds.map((fund) => (fund.currentValue / Math.max(totalValue, 1)) * fund.expenseRatio)
  );
  const expenseRatioDragEstimate = round((weightedExpenseRatio / 100) * totalValue);
  const weightedPortfolioReturn = round(
    sum(
      funds.map((fund) => {
        const simpleReturn =
          fund.investedAmount > 0
            ? ((fund.currentValue - fund.investedAmount) / fund.investedAmount) * 100
            : 0;
        const usableReturn = fund.annualizedReturn > 0 ? fund.annualizedReturn : simpleReturn;
        return (fund.currentValue / Math.max(totalValue, 1)) * usableReturn;
      })
    ),
    2
  );
  const weightedBenchmarkReturn = round(
    sum(
      funds.map((fund) => {
        const benchmark = fund.benchmarkReturn > 0 ? fund.benchmarkReturn : getBenchmarkMapping(fund.category).fallbackReturn;
        return (fund.currentValue / Math.max(totalValue, 1)) * benchmark;
      })
    ),
    2
  );
  const primaryBenchmark = getBenchmarkMapping(funds[0]?.category ?? "equity");
  const xirrAnalysis = calculateXirrFromTransactions(
    funds.flatMap((fund) => fund.transactions ?? []),
    totalValue
  );

  const allocationShare = assetAllocation.map((item) => ({
    ...item,
    share: totalValue === 0 ? 0 : (item.value / totalValue) * 100
  }));
  const dominantCategory = allocationShare.find((item) => item.share > 70);
  const concentratedFund = funds.find((fund) => fund.currentValue / Math.max(totalValue, 1) > 0.4);
  const exactOverlapConcern = fundOverlap.find(
    (item) => item.status === "exact" && (item.overlapPercent ?? 0) > 18
  );
  const estimatedOverlapConcern = fundOverlap.find(
    (item) => item.status === "estimated" && (item.overlapPercent ?? 0) > 18
  );

  const rebalancingSuggestions = [
    weightedExpenseRatio > 1.1
      ? "Expense ratio drag is meaningful. Shift core exposure toward lower-cost index or diversified core holdings."
      : "Expense ratio drag is reasonable for the current mix.",
    exactOverlapConcern
      ? "You have measurable overlap between some funds. Consolidating similar sleeves can simplify the portfolio."
      : estimatedOverlapConcern
        ? "Overlap looks elevated on an estimated basis, but actual holdings data would improve confidence."
        : "No large overlap signal is visible from the available data.",
    dominantCategory
      ? `Your ${dominantCategory.category} allocation is dominant. Add complementary assets to reduce concentration risk.`
      : "Asset allocation is reasonably distributed across categories."
  ];

  const concentrationWarnings = [
    dominantCategory ? `${dominantCategory.category} is more than 70% of portfolio value.` : "",
    concentratedFund ? `${concentratedFund.fundName} alone is over 40% of portfolio value.` : "",
    ...fundOverlap
      .filter((item) => (item.overlapPercent ?? 0) > 20)
      .map((item) =>
        item.status === "exact"
          ? `${item.pair} has exact overlap above 20%.`
          : `${item.pair} has estimated overlap above 20%; actual holdings would confirm it.`
      )
  ].filter(Boolean);

  return {
    reconstructedHoldings: funds,
    assetAllocation,
    fundOverlap,
    expenseRatioDragEstimate,
    benchmarkComparison: {
      portfolioReturn: round(weightedPortfolioReturn, 2),
      benchmarkReturn: round(weightedBenchmarkReturn, 2),
      alpha: round(weightedPortfolioReturn - weightedBenchmarkReturn, 2),
      benchmarkName: primaryBenchmark.benchmarkName,
      status: "estimated",
      source: primaryBenchmark.source
    },
    xirrApproximation: xirrAnalysis.status === "exact" ? xirrAnalysis.value : null,
    xirrAnalysis,
    rebalancingSuggestions,
    concentrationWarnings,
    assumptionsUsed,
    confidence: {
      label:
        xirrAnalysis.status === "exact"
          ? fundOverlap.some((item) => item.status === "estimated")
            ? "estimated"
            : "exact"
          : "estimated",
      score:
        xirrAnalysis.status === "exact"
          ? fundOverlap.some((item) => item.status === "estimated")
            ? 80
            : 88
          : totalInvested > 0
            ? 70
            : 45,
      explanation:
        xirrAnalysis.status === "exact"
          ? "Portfolio return includes transaction-based XIRR, though some overlap and benchmark fields may still be estimated."
          : "Snapshot analytics are available, but XIRR stays unavailable until dated cash flows are provided.",
      lastUpdated: new Date().toISOString()
    }
  };
}

export function parsePortfolioCsv(csvText: string) {
  return parsePortfolioCsvText(csvText);
}

export function mockParseForm16() {
  return {
    annualGrossSalary: 1800000,
    basicSalary: 720000,
    hraReceived: 300000,
    annualRentPaid: 360000,
    cityType: "metro" as const,
    bonus: 150000,
    employerPf: 86400,
    professionalTax: 2400,
    section80c: 120000,
    section80d: 18000,
    npsEmployee: 25000,
    npsEmployer: 30000,
    homeLoanInterest: 0,
    otherDeductions: 0,
    dataQuality: "demo" as const,
    sourceLabel: "Demo sample loaded"
  };
}
