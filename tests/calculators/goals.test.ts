import { describe, expect, it } from "vitest";
import { buildGoalFundingPlan } from "@/lib/calculators/goals";

describe("buildGoalFundingPlan", () => {
  it("funds urgent high-priority goals before lower-priority goals", () => {
    const now = new Date("2026-03-01T00:00:00.000Z");
    const result = buildGoalFundingPlan({
      lifeGoals: [
        {
          id: "goal-home",
          title: "Home down payment",
          targetAmount: 2000000,
          targetYear: 2028,
          targetDate: "2028-06-01",
          priority: "high",
          type: "home"
        },
        {
          id: "goal-travel",
          title: "Europe trip",
          targetAmount: 500000,
          targetYear: 2030,
          priority: "low",
          type: "travel"
        }
      ],
      expectedInflation: 6,
      riskAppetite: "balanced",
      monthlyAvailable: 25000,
      currentEmergencyFund: 50000,
      emergencyFundTarget: 300000,
      retirementMonthlyNeed: 12000,
      now
    });

    const homeGoal = result.goalStatuses.find((goal) => goal.goalId === "goal-home")!;
    const travelGoal = result.goalStatuses.find((goal) => goal.goalId === "goal-travel")!;

    expect(result.waterfall[0]?.bucket).toBe("emergency_fund");
    expect(homeGoal.recommendedMonthlySip).toBeGreaterThanOrEqual(travelGoal.recommendedMonthlySip);
  });
});
