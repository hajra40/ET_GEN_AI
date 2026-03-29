import { describe, expect, it } from "vitest";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { demoProfiles } from "@/lib/data/demo-profiles";
import { totalInvestments } from "@/lib/calculators/shared";

describe("calculateFirePlan", () => {
  it("builds a monthly roadmap and goal funding plan for demo profile Aanya", () => {
    const profile = demoProfiles.find((item) => item.email === "aanya@demo.in")!;
    const result = calculateFirePlan({
      age: profile.age,
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
      savings: profile.currentSavings,
      investments: totalInvestments(profile.currentInvestments),
      retirementTargetAge: profile.retirementTargetAge,
      expectedInflation: 6,
      expectedReturnRate: 11,
      lifeGoals: profile.financialGoals,
      riskAppetite: profile.riskAppetite,
      currentEmergencyFund: profile.emergencyFund,
      insuranceCoverage: profile.insuranceCoverage,
      dependents: profile.dependents,
      maritalStatus: profile.maritalStatus
    });

    expect(result.monthlyRoadmap?.length).toBeGreaterThan(12);
    expect(result.goalFundingPlan?.goalStatuses.length).toBeGreaterThan(0);
    expect(result.assumptionsUsed?.length).toBeGreaterThan(0);
  });

  it("handles a no-goals user without failing", () => {
    const result = calculateFirePlan({
      age: 30,
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      savings: 300000,
      investments: 500000,
      retirementTargetAge: 58,
      expectedInflation: 6,
      expectedReturnRate: 10,
      lifeGoals: [],
      riskAppetite: "balanced",
      currentEmergencyFund: 150000,
      dependents: 0,
      maritalStatus: "single"
    });

    expect(result.goalFundingPlan?.goalStatuses).toHaveLength(0);
    expect(result.yearByYearRoadmap.length).toBeGreaterThan(0);
  });

  it("flags underfunded users when urgent goals crowd out retirement", () => {
    const result = calculateFirePlan({
      age: 35,
      monthlyIncome: 70000,
      monthlyExpenses: 62000,
      savings: 50000,
      investments: 100000,
      retirementTargetAge: 50,
      expectedInflation: 6,
      expectedReturnRate: 9,
      lifeGoals: [
        {
          id: "goal-home",
          title: "Home down payment",
          targetAmount: 4000000,
          targetYear: new Date().getFullYear() + 3,
          priority: "high",
          type: "home"
        }
      ],
      riskAppetite: "conservative",
      currentEmergencyFund: 10000,
      dependents: 1,
      maritalStatus: "married",
      insuranceCoverage: {
        lifeCover: 0,
        healthCover: 0,
        disabilityCover: 0,
        personalAccidentCover: 0
      }
    });

    expect(result.goalFundingPlan?.underfundedItems.length).toBeGreaterThan(0);
    expect(result.onTrack).toBe(false);
  });
});
