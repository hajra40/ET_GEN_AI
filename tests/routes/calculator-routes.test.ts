import { describe, expect, it } from "vitest";
import { POST as firePost } from "@/app/api/fire/route";
import { POST as taxPost } from "@/app/api/tax/route";
import { POST as portfolioPost } from "@/app/api/portfolio/route";

describe("calculator API routes", () => {
  it("returns FIRE calculation output", async () => {
    const response = await firePost(
      new Request("http://localhost/api/fire", {
        method: "POST",
        body: JSON.stringify({
          age: 30,
          monthlyIncome: 100000,
          monthlyExpenses: 50000,
          savings: 200000,
          investments: 300000,
          retirementTargetAge: 58,
          expectedInflation: 6,
          expectedReturnRate: 10,
          lifeGoals: [],
          riskAppetite: "balanced"
        })
      })
    );
    const data = await response.json();

    expect(data.monthlySipRequired).toBeDefined();
  });

  it("returns tax comparison output", async () => {
    const response = await taxPost(
      new Request("http://localhost/api/tax", {
        method: "POST",
        body: JSON.stringify({
          annualGrossSalary: 1600000,
          basicSalary: 640000,
          hraReceived: 0,
          annualRentPaid: 0,
          cityType: "non_metro",
          bonus: 0,
          employerPf: 0,
          professionalTax: 0,
          section80c: 0,
          section80d: 0,
          npsEmployee: 0,
          npsEmployer: 0,
          homeLoanInterest: 0,
          otherDeductions: 0
        })
      })
    );
    const data = await response.json();

    expect(data.bestRegime).toBeDefined();
  });

  it("returns portfolio analysis output", async () => {
    const response = await portfolioPost(
      new Request("http://localhost/api/portfolio", {
        method: "POST",
        body: JSON.stringify([
          {
            fundName: "Alpha",
            category: "Large Cap Equity",
            investedAmount: 100000,
            currentValue: 120000,
            expenseRatio: 0.8,
            benchmarkReturn: 0,
            annualizedReturn: 0,
            styleTags: [],
            topHoldings: []
          }
        ])
      })
    );
    const data = await response.json();

    expect(data.xirrAnalysis.status).toBe("unavailable");
  });
});
