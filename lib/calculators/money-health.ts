import type {
  MoneyHealthDimensionKey,
  MoneyHealthDimensionScore,
  MoneyHealthScoreResult,
  Recommendation,
  UserProfile
} from "@/lib/types";
import {
  getAssumptionsForModule,
  getDebtStressThresholds,
  getEmergencyFundTargetMonths,
  getInflationDefault,
  getRiskAdjustedReturn,
  moneyHealthStatusCutoffs,
  moneyHealthWeights
} from "@/lib/config/finance-assumptions";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { calculateInsuranceGap } from "@/lib/calculators/insurance";
import {
  getMetroCityFlag,
  monthlyObligation,
  monthlySurplus,
  totalInvestments
} from "@/lib/calculators/shared";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import { clamp, round } from "@/lib/utils";

function getDimensionLabel(key: MoneyHealthDimensionKey) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatus(score: number): MoneyHealthDimensionScore["status"] {
  if (score >= moneyHealthStatusCutoffs.excellent) {
    return "excellent";
  }

  if (score >= moneyHealthStatusCutoffs.good) {
    return "good";
  }

  if (score >= moneyHealthStatusCutoffs.watch) {
    return "watch";
  }

  return "critical";
}

function getSeverity(score: number): NonNullable<MoneyHealthDimensionScore["severity"]> {
  if (score >= 80) {
    return "low";
  }

  if (score >= 60) {
    return "medium";
  }

  if (score >= 40) {
    return "high";
  }

  return "critical";
}

function buildRecommendationMap(emergencyTargetMonths: number): Record<MoneyHealthDimensionKey, Recommendation> {
  return {
    emergency_preparedness: {
      id: "emergency-fund",
      title: "Strengthen your emergency reserve",
      description: `Build toward at least ${emergencyTargetMonths} months of core expenses before increasing long-term risk.`,
      priority: 1,
      impact: "high",
      category: "cashflow"
    },
    insurance_coverage: {
      id: "insurance-gap",
      title: "Close your protection gap",
      description: "Upgrade term, health, disability, and accident cover before relying on investment returns.",
      priority: 2,
      impact: "high",
      category: "protection"
    },
    investment_diversification: {
      id: "diversify",
      title: "Reduce concentration",
      description: "Spread investments across more goal-linked buckets instead of overloading one sleeve.",
      priority: 3,
      impact: "medium",
      category: "investing"
    },
    debt_health: {
      id: "debt-control",
      title: "Bring EMI stress down",
      description: "High fixed obligations make every other financial goal harder to fund.",
      priority: 4,
      impact: "high",
      category: "debt"
    },
    tax_efficiency: {
      id: "tax-action",
      title: "Capture missed tax benefits",
      description: "Use remaining deductions and validate the right tax regime with real salary inputs.",
      priority: 5,
      impact: "medium",
      category: "tax"
    },
    retirement_readiness: {
      id: "retirement-pace",
      title: "Increase retirement contribution pace",
      description: "Retirement is competing with other goals, so contribution discipline matters more than ever.",
      priority: 2,
      impact: "high",
      category: "retirement"
    }
  };
}

export function calculateMoneyHealthScore(profile: UserProfile): MoneyHealthScoreResult {
  const assumptionsUsed = [
    ...getAssumptionsForModule("money-health"),
    ...getAssumptionsForModule("fire"),
    ...getAssumptionsForModule("tax"),
    ...getAssumptionsForModule("insurance")
  ].filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const monthlyCommitments = monthlyObligation(profile);
  const monthlyFreeCash = monthlySurplus(profile);
  const totalInvested = totalInvestments(profile.currentInvestments);
  const emergencyMonthsCovered =
    monthlyCommitments === 0 ? 12 : profile.emergencyFund / Math.max(monthlyCommitments, 1);
  const emergencyTargetMonths = getEmergencyFundTargetMonths({
    dependents: profile.dependents,
    maritalStatus: profile.maritalStatus,
    riskAppetite: profile.riskAppetite
  });
  const emergencyScore = clamp(
    (emergencyMonthsCovered / Math.max(emergencyTargetMonths, 1)) * 100,
    0,
    100
  );
  const insuranceAnalysis = calculateInsuranceGap(profile);

  const lifeCoverageScore =
    insuranceAnalysis.lifeCoverTarget <= 0
      ? 100
      : clamp(
          ((insuranceAnalysis.lifeCoverTarget - insuranceAnalysis.lifeCoverGap) /
            insuranceAnalysis.lifeCoverTarget) *
            100,
          0,
          100
        );
  const healthCoverageScore =
    insuranceAnalysis.healthCoverTarget <= 0
      ? 100
      : clamp(
          ((insuranceAnalysis.healthCoverTarget - insuranceAnalysis.healthCoverGap) /
            insuranceAnalysis.healthCoverTarget) *
            100,
          0,
          100
        );
  const disabilityCoverageScore =
    insuranceAnalysis.disabilityCoverTarget <= 0
      ? 100
      : clamp(
          ((insuranceAnalysis.disabilityCoverTarget - insuranceAnalysis.disabilityCoverGap) /
            insuranceAnalysis.disabilityCoverTarget) *
            100,
          0,
          100
        );
  const accidentCoverageScore =
    insuranceAnalysis.personalAccidentCoverTarget <= 0
      ? 100
      : clamp(
          ((insuranceAnalysis.personalAccidentCoverTarget -
            insuranceAnalysis.personalAccidentCoverGap) /
            insuranceAnalysis.personalAccidentCoverTarget) *
            100,
          0,
          100
        );
  const insuranceScore = round(
    lifeCoverageScore * 0.45 +
      healthCoverageScore * 0.25 +
      disabilityCoverageScore * 0.15 +
      accidentCoverageScore * 0.15
  );

  const activeAssetBuckets = Object.values(profile.currentInvestments).filter((value) => value > 0).length;
  const cashShare =
    totalInvested <= 0 ? 0 : (profile.currentInvestments.cash / Math.max(totalInvested, 1)) * 100;
  const diversificationScore = clamp(activeAssetBuckets * 12 + (cashShare < 25 ? 18 : 8), 10, 100);

  const debtThresholds = getDebtStressThresholds();
  const emiRatio = profile.loanEmi / Math.max(profile.monthlyIncome, 1);
  const debtScore = clamp(
    100 -
      (emiRatio * 100 > debtThresholds.critical
        ? 60
        : emiRatio * 100 > debtThresholds.watch
          ? 35
          : emiRatio * 100 * 0.8) -
      (monthlyFreeCash < 0.1 * profile.monthlyIncome ? 15 : 0),
    5,
    100
  );

  const rentProxy = profile.monthlyExpenses * (getMetroCityFlag(profile.city) ? 4.2 : 3.2);
  const taxResult = compareTaxRegimes({
    annualGrossSalary: profile.salaryBreakdown.annualGrossSalary,
    basicSalary: profile.salaryBreakdown.basicSalary,
    hraReceived: profile.salaryBreakdown.hraReceived,
    annualRentPaid: rentProxy,
    cityType: getMetroCityFlag(profile.city) ? "metro" : "non_metro",
    bonus: profile.salaryBreakdown.bonus,
    employerPf: profile.salaryBreakdown.employerPf,
    professionalTax: profile.salaryBreakdown.professionalTax,
    section80c: profile.salaryBreakdown.section80c,
    section80d: profile.salaryBreakdown.section80d,
    npsEmployee: profile.salaryBreakdown.npsEmployee,
    npsEmployer: profile.salaryBreakdown.npsEmployer,
    homeLoanInterest: profile.salaryBreakdown.homeLoanInterest,
    otherDeductions: profile.salaryBreakdown.otherDeductions,
    dataQuality: "estimated",
    sourceLabel: "Profile-level money-health proxy"
  });
  const deductionUtilization =
    ((Math.min(profile.salaryBreakdown.section80c, 150000) / 150000) +
      (Math.min(profile.salaryBreakdown.section80d, 25000) / 25000) +
      (Math.min(profile.salaryBreakdown.npsEmployee, 50000) / 50000)) /
    3;
  const taxScore = clamp(
    deductionUtilization * 65 +
      (taxResult.bestRegime === profile.taxRegimePreference ? 20 : 10) +
      (taxResult.savingsDifference > 50000 ? 10 : 5),
    10,
    100
  );

  const firePlan = calculateFirePlan({
    age: profile.age,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
    savings: profile.currentSavings,
    investments: totalInvested,
    retirementTargetAge: profile.retirementTargetAge,
    expectedInflation: getInflationDefault(),
    expectedReturnRate: getRiskAdjustedReturn(profile.riskAppetite),
    lifeGoals: profile.financialGoals,
    riskAppetite: profile.riskAppetite,
    currentEmergencyFund: profile.emergencyFund,
    insuranceCoverage: profile.insuranceCoverage,
    dependents: profile.dependents,
    maritalStatus: profile.maritalStatus,
    cityType: profile.cityType ?? (getMetroCityFlag(profile.city) ? "metro" : "non_metro"),
    employerBenefits: profile.employerBenefits,
    debtDetails: profile.debtDetails,
    salaryBreakdown: profile.salaryBreakdown
  });
  const retirementScore = clamp(
    (firePlan.projectedCorpus / Math.max(firePlan.targetRetirementCorpus, 1)) * 100,
    5,
    100
  );

  const dimensions: MoneyHealthDimensionScore[] = [
    {
      key: "emergency_preparedness",
      label: getDimensionLabel("emergency_preparedness"),
      score: round(emergencyScore),
      maxScore: 100,
      explanation: `You have about ${round(emergencyMonthsCovered, 1)} months of expenses covered versus a ${emergencyTargetMonths}-month target.`,
      status: getStatus(emergencyScore),
      reason:
        emergencyMonthsCovered >= emergencyTargetMonths
          ? "Liquidity coverage is broadly adequate for current obligations."
          : "Emergency liquidity is below the target needed to protect goals and EMI commitments.",
      inputsUsed: {
        emergencyFund: profile.emergencyFund,
        monthlyCommitments: round(monthlyCommitments),
        emergencyMonthsCovered: round(emergencyMonthsCovered, 1)
      },
      assumptionsUsed: getAssumptionsForModule("money-health"),
      topAction:
        emergencyMonthsCovered >= emergencyTargetMonths
          ? "Keep the emergency fund ring-fenced."
          : "Divert fresh surplus toward cash reserves before adding more long-term risk.",
      severity: getSeverity(emergencyScore),
      missingData: [],
      scoreDrivers: [
        `Emergency target set at ${emergencyTargetMonths} months based on family obligations.`,
        `Current funded runway is ${round(emergencyMonthsCovered, 1)} months.`
      ]
    },
    {
      key: "insurance_coverage",
      label: getDimensionLabel("insurance_coverage"),
      score: round(insuranceScore),
      maxScore: 100,
      explanation: "Protection cover is measured against income replacement, health, disability, and accident cover baselines.",
      status: getStatus(insuranceScore),
      reason:
        insuranceScore >= 75
          ? "Protection is broadly aligned with the current family and income profile."
          : "One or more protection gaps could materially disrupt long-term plans.",
      inputsUsed: {
        lifeCoverGap: insuranceAnalysis.lifeCoverGap,
        healthCoverGap: insuranceAnalysis.healthCoverGap,
        disabilityCoverGap: insuranceAnalysis.disabilityCoverGap,
        accidentCoverGap: insuranceAnalysis.personalAccidentCoverGap
      },
      assumptionsUsed: insuranceAnalysis.assumptionsUsed,
      topAction: insuranceAnalysis.recommendedActions[0],
      severity: getSeverity(insuranceScore),
      missingData: insuranceAnalysis.missingInputs,
      scoreDrivers: [
        `Life cover gap: Rs.${insuranceAnalysis.lifeCoverGap.toLocaleString("en-IN")}.`,
        `Health cover gap: Rs.${insuranceAnalysis.healthCoverGap.toLocaleString("en-IN")}.`
      ]
    },
    {
      key: "investment_diversification",
      label: getDimensionLabel("investment_diversification"),
      score: round(diversificationScore),
      maxScore: 100,
      explanation: `Your money is spread across ${activeAssetBuckets} active asset buckets, with cash at ${round(cashShare, 1)}% of invested assets.`,
      status: getStatus(diversificationScore),
      reason:
        activeAssetBuckets >= 5
          ? "The portfolio is spread across a reasonably wide set of sleeves."
          : "Too few active sleeves can leave the portfolio overly dependent on one outcome.",
      inputsUsed: {
        activeAssetBuckets,
        cashShare: round(cashShare, 1),
        totalInvested: round(totalInvested)
      },
      assumptionsUsed: [],
      topAction:
        activeAssetBuckets >= 5
          ? "Keep each bucket tied to a goal instead of adding random products."
          : "Add the missing fixed-income or retirement sleeve before adding more equity funds.",
      severity: getSeverity(diversificationScore),
      missingData: [],
      scoreDrivers: [
        `${activeAssetBuckets} active asset buckets detected.`,
        cashShare > 30 ? "Cash concentration is still high." : "Cash concentration is not the main issue."
      ]
    },
    {
      key: "debt_health",
      label: getDimensionLabel("debt_health"),
      score: round(debtScore),
      maxScore: 100,
      explanation: `Your EMI-to-income ratio is ${round(emiRatio * 100, 1)}%, and monthly surplus is used as a stress test.`,
      status: getStatus(debtScore),
      reason:
        emiRatio * 100 > debtThresholds.critical
          ? "Fixed obligations are crowding out resilience and investing."
          : emiRatio * 100 > debtThresholds.watch
            ? "Debt is manageable but needs active monitoring."
            : "Debt load looks manageable relative to current income.",
      inputsUsed: {
        loanEmi: profile.loanEmi,
        monthlyIncome: profile.monthlyIncome,
        monthlySurplus: round(monthlyFreeCash)
      },
      assumptionsUsed: getAssumptionsForModule("money-health"),
      topAction:
        emiRatio * 100 > debtThresholds.watch
          ? "Avoid new leverage and redirect windfalls to the costliest debt."
          : "Keep EMI growth slower than income growth.",
      severity: getSeverity(debtScore),
      missingData:
        profile.debtDetails?.length ? [] : ["Debt balances and rates are missing, so repayment priority is less precise."],
      scoreDrivers: [
        `EMI ratio vs watch threshold: ${round(emiRatio * 100, 1)}% vs ${debtThresholds.watch}%.`,
        `Monthly surplus: Rs.${round(monthlyFreeCash).toLocaleString("en-IN")}.`
      ]
    },
    {
      key: "tax_efficiency",
      label: getDimensionLabel("tax_efficiency"),
      score: round(taxScore),
      maxScore: 100,
      explanation: "Score reflects deduction utilization, likely regime fit, and how much the result depends on proxy rent inputs.",
      status: getStatus(taxScore),
      reason:
        taxResult.bestRegime === profile.taxRegimePreference
          ? "Your stated regime preference is aligned with the current calculation."
          : "The current calculation suggests a different regime may work better.",
      inputsUsed: {
        section80c: profile.salaryBreakdown.section80c,
        section80d: profile.salaryBreakdown.section80d,
        npsEmployee: profile.salaryBreakdown.npsEmployee,
        proxyAnnualRentPaid: round(rentProxy)
      },
      assumptionsUsed: taxResult.assumptionsUsed,
      topAction: taxResult.nextBestAction ?? taxResult.rankedSuggestions[0]?.name ?? "Validate tax inputs with Form 16 details.",
      severity: getSeverity(taxScore),
      missingData: [
        "Annual rent is proxied from monthly expenses in this scorecard unless you open Tax Wizard and enter the exact rent.",
        ...(taxResult.confidence?.label === "estimated" ? ["Tax result is using profile-level proxies, not a confirmed Form 16 extraction."] : [])
      ],
      scoreDrivers: [
        `Deduction utilization score: ${round(deductionUtilization * 100)}%.`,
        `Current best regime: ${taxResult.bestRegime.toUpperCase()}.`
      ]
    },
    {
      key: "retirement_readiness",
      label: getDimensionLabel("retirement_readiness"),
      score: round(retirementScore),
      maxScore: 100,
      explanation: "Projected retirement corpus is compared with an inflation-adjusted target while also respecting goal and emergency priorities.",
      status: getStatus(retirementScore),
      reason:
        firePlan.onTrack
          ? "Retirement funding is broadly holding up even after urgent allocations are considered."
          : "Retirement is being crowded out by current priorities or insufficient monthly surplus.",
      inputsUsed: {
        targetCorpus: firePlan.targetRetirementCorpus,
        projectedCorpus: firePlan.projectedCorpus,
        retirementSipRequired: firePlan.monthlySipRequired
      },
      assumptionsUsed: firePlan.assumptionsUsed,
      topAction: firePlan.whatToDoNow?.[3] ?? "Increase retirement investing or extend the timeline.",
      severity: getSeverity(retirementScore),
      missingData: [],
      scoreDrivers: [
        `Projected corpus: Rs.${firePlan.projectedCorpus.toLocaleString("en-IN")}.`,
        `Target corpus: Rs.${firePlan.targetRetirementCorpus.toLocaleString("en-IN")}.`
      ]
    }
  ];

  const recommendationByDimension = buildRecommendationMap(emergencyTargetMonths);
  const dimensionsByWeakness = [...dimensions].sort((left, right) => left.score - right.score);
  const recommendations = dimensionsByWeakness.slice(0, 5).map((dimension, index) => ({
    ...recommendationByDimension[dimension.key],
    priority: (index + 1) as Recommendation["priority"]
  }));

  const overallScore = round(
    dimensions.reduce(
      (total, dimension) => total + dimension.score * moneyHealthWeights[dimension.key],
      0
    )
  );
  const missingDataThatCouldChangeThis = [
    ...insuranceAnalysis.missingInputs,
    "Exact annual rent and employer benefits would improve the tax and protection scores.",
    ...(profile.debtDetails?.length ? [] : ["Detailed debt balances and rates would improve the debt-health score."])
  ];
  const scoreDrivers = dimensionsByWeakness.slice(0, 3).map(
    (dimension) => `${dimension.label}: ${dimension.reason}`
  );
  const howToImproveBy30Points = dimensionsByWeakness
    .slice(0, 3)
    .map((dimension) => dimension.topAction ?? `Improve ${dimension.label}.`);

  return {
    overallScore,
    dimensions,
    recommendations,
    narrative:
      overallScore >= 75
        ? "Your finances are on solid footing overall, with a few specific moves that can further improve resilience and clarity."
        : overallScore >= 55
          ? "Your finances are workable but uneven. The fastest gains come from the weakest two dimensions shown below."
          : "Your profile shows real stress points. Start with liquidity, protection, and fixed-obligation control before chasing higher returns.",
    scoreDrivers,
    missingDataThatCouldChangeThis,
    assumptionsUsed,
    howToImproveBy30Points,
    insuranceAnalysis,
    confidence: {
      label: "estimated",
      score: 76,
      explanation:
        "This score is deterministic, but some dimensions still use profile-level proxies such as estimated annual rent unless more exact data is provided.",
      lastUpdated: new Date().toISOString()
    }
  };
}
