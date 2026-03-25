import type {
  MoneyHealthDimensionKey,
  MoneyHealthDimensionScore,
  MoneyHealthScoreResult,
  Recommendation,
  UserProfile
} from "@/lib/types";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { totalInvestments, monthlySurplus, monthlyObligation, getMetroCityFlag } from "@/lib/calculators/shared";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import { clamp, round } from "@/lib/utils";

function getDimensionLabel(key: MoneyHealthDimensionKey) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatus(score: number): MoneyHealthDimensionScore["status"] {
  if (score >= 80) {
    return "excellent";
  }

  if (score >= 60) {
    return "good";
  }

  if (score >= 40) {
    return "watch";
  }

  return "critical";
}

export function calculateMoneyHealthScore(profile: UserProfile): MoneyHealthScoreResult {
  const monthlyCommitments = monthlyObligation(profile);
  const monthlyFreeCash = monthlySurplus(profile);
  const totalInvested = totalInvestments(profile.currentInvestments);
  const emergencyMonthsCovered = monthlyCommitments === 0 ? 12 : profile.emergencyFund / monthlyCommitments;
  const emergencyTargetMonths = profile.dependents > 0 || profile.maritalStatus === "married" ? 9 : 6;
  const emergencyScore = clamp((emergencyMonthsCovered / emergencyTargetMonths) * 100, 0, 100);

  const targetLifeCover = profile.monthlyIncome * 12 * (profile.dependents > 0 ? 15 : 10);
  const targetHealthCover = profile.maritalStatus === "married" || profile.dependents > 0 ? 1000000 : 500000;
  const lifeScore = clamp((profile.insuranceCoverage.lifeCover / Math.max(targetLifeCover, 1)) * 70, 0, 70);
  const healthScore = clamp((profile.insuranceCoverage.healthCover / targetHealthCover) * 20, 0, 20);
  const accidentScore = clamp(
    ((profile.insuranceCoverage.disabilityCover + profile.insuranceCoverage.personalAccidentCover) /
      Math.max(profile.monthlyIncome * 12 * 5, 1)) *
      10,
    0,
    10
  );
  const insuranceScore = lifeScore + healthScore + accidentScore;

  const activeAssetBuckets = Object.values(profile.currentInvestments).filter((value) => value > 0).length;
  const cashHeavyPenalty = profile.currentInvestments.cash > totalInvested * 0.3 ? 15 : 0;
  const diversificationScore = clamp(activeAssetBuckets * 14 - cashHeavyPenalty, 10, 100);

  const emiRatio = profile.loanEmi / Math.max(profile.monthlyIncome, 1);
  const debtScore = clamp(100 - emiRatio * 220 - (monthlyFreeCash < 0.1 * profile.monthlyIncome ? 12 : 0), 5, 100);

  const taxResult = compareTaxRegimes({
    annualGrossSalary: profile.salaryBreakdown.annualGrossSalary,
    basicSalary: profile.salaryBreakdown.basicSalary,
    hraReceived: profile.salaryBreakdown.hraReceived,
    annualRentPaid: getMetroCityFlag(profile.city) ? profile.monthlyExpenses * 4.2 : profile.monthlyExpenses * 3.2,
    cityType: getMetroCityFlag(profile.city) ? "metro" : "non_metro",
    bonus: profile.salaryBreakdown.bonus,
    employerPf: profile.salaryBreakdown.employerPf,
    professionalTax: profile.salaryBreakdown.professionalTax,
    section80c: profile.salaryBreakdown.section80c,
    section80d: profile.salaryBreakdown.section80d,
    npsEmployee: profile.salaryBreakdown.npsEmployee,
    npsEmployer: profile.salaryBreakdown.npsEmployer,
    homeLoanInterest: profile.salaryBreakdown.homeLoanInterest,
    otherDeductions: profile.salaryBreakdown.otherDeductions
  });
  const deductionUtilization = (
    Math.min(profile.salaryBreakdown.section80c, 150000) / 150000 +
    Math.min(profile.salaryBreakdown.section80d, 25000) / 25000 +
    Math.min(profile.salaryBreakdown.npsEmployee, 50000) / 50000
  ) / 3;
  const taxScore = clamp(deductionUtilization * 65 + (taxResult.bestRegime === profile.taxRegimePreference ? 35 : 20), 10, 100);

  const firePlan = calculateFirePlan({
    age: profile.age,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
    savings: profile.currentSavings,
    investments: totalInvested,
    retirementTargetAge: profile.retirementTargetAge,
    expectedInflation: 6,
    expectedReturnRate: profile.riskAppetite === "aggressive" ? 12 : profile.riskAppetite === "growth" ? 11 : 9,
    lifeGoals: profile.financialGoals,
    riskAppetite: profile.riskAppetite
  });
  const retirementScore = clamp((firePlan.projectedCorpus / Math.max(firePlan.targetRetirementCorpus, 1)) * 100, 5, 100);

  const dimensions: MoneyHealthDimensionScore[] = [
    {
      key: "emergency_preparedness",
      label: getDimensionLabel("emergency_preparedness"),
      score: round(emergencyScore),
      maxScore: 100,
      explanation: `You have about ${round(emergencyMonthsCovered, 1)} months of expenses covered versus a ${emergencyTargetMonths}-month target.`,
      status: getStatus(emergencyScore)
    },
    {
      key: "insurance_coverage",
      label: getDimensionLabel("insurance_coverage"),
      score: round(insuranceScore),
      maxScore: 100,
      explanation: "Protection cover is measured against income replacement and family health cover benchmarks.",
      status: getStatus(insuranceScore)
    },
    {
      key: "investment_diversification",
      label: getDimensionLabel("investment_diversification"),
      score: round(diversificationScore),
      maxScore: 100,
      explanation: `Your money is spread across ${activeAssetBuckets} active asset buckets with a check on concentration.`,
      status: getStatus(diversificationScore)
    },
    {
      key: "debt_health",
      label: getDimensionLabel("debt_health"),
      score: round(debtScore),
      maxScore: 100,
      explanation: `Your EMI-to-income ratio is ${round(emiRatio * 100, 1)}%, and monthly surplus is used as a stress test.`,
      status: getStatus(debtScore)
    },
    {
      key: "tax_efficiency",
      label: getDimensionLabel("tax_efficiency"),
      score: round(taxScore),
      maxScore: 100,
      explanation: "Score reflects deduction utilization, regime fit, and salary-structure efficiency.",
      status: getStatus(taxScore)
    },
    {
      key: "retirement_readiness",
      label: getDimensionLabel("retirement_readiness"),
      score: round(retirementScore),
      maxScore: 100,
      explanation: "Projected retirement corpus is compared with an inflation-adjusted 25x expense target.",
      status: getStatus(retirementScore)
    }
  ];

  const dimensionsByWeakness = [...dimensions].sort((left, right) => left.score - right.score);
  const recommendationByDimension: Record<MoneyHealthDimensionKey, Recommendation> = {
    emergency_preparedness: {
      id: "emergency-fund",
      title: "Strengthen your emergency reserve",
      description: `Build toward at least ${emergencyTargetMonths} months of expenses before increasing long-term risk.`,
      priority: 1,
      impact: "high",
      category: "cashflow"
    },
    insurance_coverage: {
      id: "insurance-gap",
      title: "Close your protection gap",
      description: "Upgrade term, health, and disability cover so a single shock does not derail your plan.",
      priority: 2,
      impact: "high",
      category: "protection"
    },
    investment_diversification: {
      id: "diversify",
      title: "Reduce portfolio concentration",
      description: "Spread investments across equity, debt, and goal-linked buckets instead of overloading one sleeve.",
      priority: 3,
      impact: "medium",
      category: "investing"
    },
    debt_health: {
      id: "debt-control",
      title: "Tighten debt and EMI load",
      description: "Bring EMI stress under control before stepping up aggressive investing.",
      priority: 4,
      impact: "high",
      category: "debt"
    },
    tax_efficiency: {
      id: "tax-action",
      title: "Capture missed tax benefits",
      description: "Use deductions intelligently and validate whether your chosen regime still makes sense.",
      priority: 5,
      impact: "medium",
      category: "tax"
    },
    retirement_readiness: {
      id: "retirement-pace",
      title: "Increase retirement contribution pace",
      description: "Raise SIPs or extend your timeline so the retirement corpus gap does not compound further.",
      priority: 2,
      impact: "high",
      category: "retirement"
    }
  };

  const recommendations = dimensionsByWeakness.slice(0, 5).map((dimension, index) => ({
    ...recommendationByDimension[dimension.key],
    priority: (index + 1) as Recommendation["priority"]
  }));

  const overallScore = round(dimensions.reduce((total, dimension) => total + dimension.score, 0) / dimensions.length);

  return {
    overallScore,
    dimensions,
    recommendations,
    narrative:
      overallScore >= 75
        ? "Your money habits are in a strong place overall, but a few focused fixes can accelerate wealth creation."
        : overallScore >= 55
          ? "Your finances are functional but uneven. The next few moves should focus on the weakest two dimensions."
          : "Your profile shows real stress points. Start with protection, emergency reserves, and cash-flow stability before chasing returns."
  };
}
