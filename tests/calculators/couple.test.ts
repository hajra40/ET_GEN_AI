import { describe, expect, it } from "vitest";
import { calculateCouplePlan } from "@/lib/calculators/couple";
import { demoProfiles } from "@/lib/data/demo-profiles";

describe("calculateCouplePlan", () => {
  it("returns scenario comparisons and a goal ownership map", () => {
    const partnerA = demoProfiles.find((item) => item.email === "rohan@demo.in")!;
    const partnerB = demoProfiles.find((item) => item.email === "priya@demo.in")!;
    const result = calculateCouplePlan({
      partnerA,
      partnerB,
      sharedMonthlyExpenses: 35000,
      jointGoals: [...partnerA.financialGoals, ...partnerB.financialGoals]
    });

    expect(result.scenarioComparisons?.length).toBe(4);
    expect(result.goalOwnershipMap?.length).toBeGreaterThan(0);
    expect(result.combinedSurplus).toBeGreaterThan(0);
  });
});
