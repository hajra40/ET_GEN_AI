import { describe, expect, it } from "vitest";
import { calculatePortfolioXRay } from "@/lib/calculators/portfolio";
import { demoPortfolios } from "@/lib/data/demo-portfolios";

describe("calculatePortfolioXRay", () => {
  it("does not fake XIRR for snapshot-only data", () => {
    const funds = demoPortfolios["kabir@demo.in"];
    const result = calculatePortfolioXRay(funds);

    expect(result.xirrAnalysis?.status).toBe("unavailable");
    expect(result.xirrApproximation).toBeNull();
  });

  it("returns exact XIRR when transactions are available", () => {
    const result = calculatePortfolioXRay([
      {
        fundName: "Gamma Flexi Cap Fund",
        category: "Flexi Cap Equity",
        investedAmount: 100000,
        currentValue: 125000,
        expenseRatio: 1.1,
        benchmarkReturn: 11.5,
        annualizedReturn: 0,
        styleTags: ["core", "flexi"],
        topHoldings: [],
        transactions: [
          { date: "2023-01-01", amount: 50000, type: "buy" },
          { date: "2023-07-01", amount: 25000, type: "sip" },
          { date: "2024-01-01", amount: 25000, type: "sip" }
        ]
      }
    ]);

    expect(result.xirrAnalysis?.status).toBe("exact");
    expect(result.xirrAnalysis?.value).not.toBeNull();
  });
});
