import type {
  PortfolioFund,
  PortfolioXRayResult
} from "@/lib/types";
import { round, sum } from "@/lib/utils";

export function calculatePortfolioXRay(funds: PortfolioFund[]): PortfolioXRayResult {
  const totalValue = sum(funds.map((fund) => fund.currentValue));
  const allocationMap = new Map<string, number>();

  funds.forEach((fund) => {
    allocationMap.set(fund.category, (allocationMap.get(fund.category) ?? 0) + fund.currentValue);
  });

  const assetAllocation = Array.from(allocationMap.entries())
    .map(([category, value]) => ({ category, value: round(value) }))
    .sort((left, right) => right.value - left.value);

  const fundOverlap: PortfolioXRayResult["fundOverlap"] = [];
  for (let leftIndex = 0; leftIndex < funds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < funds.length; rightIndex += 1) {
      const left = funds[leftIndex];
      const right = funds[rightIndex];
      const leftMap = new Map(left.topHoldings.map((holding) => [holding.name, holding.weight]));
      const rightMap = new Map(right.topHoldings.map((holding) => [holding.name, holding.weight]));
      let overlap = 0;

      leftMap.forEach((weight, name) => {
        const counterpart = rightMap.get(name);
        if (counterpart) {
          overlap += Math.min(weight, counterpart);
        }
      });

      if (overlap > 0) {
        fundOverlap.push({
          pair: `${left.fundName} + ${right.fundName}`,
          overlapPercent: round(overlap, 1)
        });
      }
    }
  }

  const weightedExpenseRatio = sum(
    funds.map((fund) => (fund.currentValue / Math.max(totalValue, 1)) * fund.expenseRatio)
  );
  const expenseRatioDragEstimate = round((weightedExpenseRatio / 100) * totalValue);
  const portfolioReturn = round(
    sum(funds.map((fund) => (fund.currentValue / Math.max(totalValue, 1)) * fund.annualizedReturn)),
    2
  );
  const benchmarkReturn = round(
    sum(funds.map((fund) => (fund.currentValue / Math.max(totalValue, 1)) * fund.benchmarkReturn)),
    2
  );

  const allocationShare = assetAllocation.map((item) => ({
    ...item,
    share: totalValue === 0 ? 0 : (item.value / totalValue) * 100
  }));
  const dominantCategory = allocationShare.find((item) => item.share > 70);
  const concentratedFund = funds.find((fund) => fund.currentValue / Math.max(totalValue, 1) > 0.4);

  const rebalancingSuggestions = [
    weightedExpenseRatio > 1.1
      ? "Expense ratio drag is meaningful. Shift core exposure toward lower-cost index or flexi-cap holdings."
      : "Expense ratio drag is reasonable for an active-plus-core portfolio.",
    fundOverlap.some((item) => item.overlapPercent > 18)
      ? "You have meaningful overlap between funds. Consolidating similar large-cap holdings can simplify the portfolio."
      : "Fund overlap is manageable, so diversification is working reasonably well.",
    dominantCategory
      ? `Your ${dominantCategory.category} allocation is dominant. Add complementary assets to reduce concentration risk.`
      : "Asset allocation is reasonably distributed across categories."
  ];

  const concentrationWarnings = [
    dominantCategory ? `${dominantCategory.category} is more than 70% of portfolio value.` : "",
    concentratedFund ? `${concentratedFund.fundName} alone is over 40% of portfolio value.` : "",
    ...fundOverlap
      .filter((item) => item.overlapPercent > 20)
      .map((item) => `${item.pair} has overlap above 20%.`)
  ].filter(Boolean);

  return {
    reconstructedHoldings: funds,
    assetAllocation,
    fundOverlap: fundOverlap.sort((left, right) => right.overlapPercent - left.overlapPercent),
    expenseRatioDragEstimate,
    benchmarkComparison: {
      portfolioReturn,
      benchmarkReturn,
      alpha: round(portfolioReturn - benchmarkReturn, 2)
    },
    xirrApproximation: portfolioReturn,
    rebalancingSuggestions,
    concentrationWarnings
  };
}

export function parsePortfolioCsv(csvText: string): PortfolioFund[] {
  const rows = csvText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return [];
  }

  const headers = rows[0].split(",").map((header) => header.trim().toLowerCase());
  const columnIndex = (name: string) => headers.findIndex((header) => header === name);

  return rows.slice(1).map((row) => {
    const cells = row.split(",").map((cell) => cell.trim());

    return {
      fundName: cells[columnIndex("fundname")] ?? "Imported Fund",
      category: cells[columnIndex("category")] ?? "Equity",
      investedAmount: Number(cells[columnIndex("investedamount")] ?? 0),
      currentValue: Number(cells[columnIndex("currentvalue")] ?? 0),
      expenseRatio: Number(cells[columnIndex("expenseratio")] ?? 1),
      benchmarkReturn: Number(cells[columnIndex("benchmarkreturn")] ?? 11),
      annualizedReturn: Number(cells[columnIndex("annualizedreturn")] ?? 10),
      styleTags: (cells[columnIndex("styletags")] ?? "core").split("|"),
      topHoldings: [
        { name: "HDFC Bank", weight: 6 },
        { name: "Reliance Industries", weight: 5 },
        { name: "ICICI Bank", weight: 4 }
      ]
    };
  });
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
    otherDeductions: 0
  };
}
