import type {
  AllocationGuidance,
  FirePlanInput,
  FirePlanResult,
  FireRoadmapItem,
  MonthlyRoadmapItem,
  UserProfile,
  YearlyRoadmapRollup
} from "@/lib/types";
import {
  getAssumptionsForModule,
  getEmergencyFundTargetMonths,
  getRetirementCorpusMultiple
} from "@/lib/config/finance-assumptions";
import { buildGoalFundingPlan } from "@/lib/calculators/goals";
import { calculateInsuranceGap } from "@/lib/calculators/insurance";
import {
  futureValueLumpsum,
  futureValueSip,
  solveRequiredSip,
  yearsBetween
} from "@/lib/calculators/shared";
import { round, sum } from "@/lib/utils";

function getAssetAllocationGuidance(age: number, retirementAge: number): AllocationGuidance[] {
  const yearsToRetire = yearsBetween(age, retirementAge);
  const nowEquity = Math.max(40, Math.min(80, 100 - age));
  const preRetirementEquity =
    yearsToRetire <= 10 ? Math.max(35, nowEquity - 15) : Math.max(40, nowEquity - 10);

  return [
    {
      lifeStage: "Current accumulation phase",
      equity: nowEquity,
      debt: 100 - nowEquity - 5,
      gold: 5,
      cash: 0,
      description: "Use growth-oriented assets while keeping some ballast in debt and gold."
    },
    {
      lifeStage: "10 years before retirement",
      equity: preRetirementEquity,
      debt: 100 - preRetirementEquity - 8,
      gold: 5,
      cash: 3,
      description: "Reduce drawdown risk by gradually shifting fresh contributions toward debt."
    },
    {
      lifeStage: "Retirement income phase",
      equity: Math.max(25, preRetirementEquity - 15),
      debt: 55,
      gold: 10,
      cash: 10,
      description: "Prioritize income stability, liquidity, and lower sequence-of-return risk."
    }
  ];
}

function toPlannerProfile(input: FirePlanInput): UserProfile {
  return {
    id: "fire-planner-profile",
    name: "Planner Profile",
    email: "local@planner",
    password: "",
    city: input.cityType === "metro" ? "Mumbai" : "Non-metro",
    cityType: input.cityType,
    age: input.age,
    maritalStatus: input.maritalStatus ?? "single",
    dependents: input.dependents ?? 0,
    monthlyIncome: input.monthlyIncome,
    monthlyExpenses: input.monthlyExpenses,
    loanEmi: sum((input.debtDetails ?? []).map((debt) => debt.emi)),
    currentSavings: input.savings,
    emergencyFund: input.currentEmergencyFund ?? 0,
    insuranceCoverage: input.insuranceCoverage ?? {
      lifeCover: 0,
      healthCover: 0,
      disabilityCover: 0,
      personalAccidentCover: 0
    },
    currentInvestments: {
      equity: 0,
      debt: 0,
      gold: 0,
      cash: 0,
      epf: 0,
      ppf: 0,
      nps: 0,
      international: 0,
      alternatives: 0
    },
    riskAppetite: input.riskAppetite,
    retirementTargetAge: input.retirementTargetAge,
    taxRegimePreference: "unsure",
    financialGoals: input.lifeGoals,
    salaryBreakdown: input.salaryBreakdown ?? {
      annualGrossSalary: 0,
      basicSalary: 0,
      hraReceived: 0,
      specialAllowance: 0,
      bonus: 0,
      employerPf: 0,
      professionalTax: 0,
      standardDeduction: 0,
      section80c: 0,
      section80d: 0,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0
    },
    employerBenefits: input.employerBenefits,
    debtDetails: input.debtDetails,
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildMonthlyRoadmap(params: {
  currentCorpus: number;
  expectedReturnRate: number;
  age: number;
  retirementTargetAge: number;
  goalFundingPlan: NonNullable<FirePlanResult["goalFundingPlan"]>;
  insuranceActions: string[];
  taxOptimizationNote?: string;
  goals: FirePlanInput["lifeGoals"];
  currentEmergencyFund: number;
}) {
  const start = new Date();
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const retirementDate = new Date(
    startMonth.getFullYear() + yearsBetween(params.age, params.retirementTargetAge),
    startMonth.getMonth(),
    1
  );
  const lastGoalDate = params.goals.reduce((latest, goal) => {
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : new Date(goal.targetYear, 11, 1);
    return targetDate > latest ? targetDate : latest;
  }, retirementDate);
  const endDate = lastGoalDate > retirementDate ? lastGoalDate : retirementDate;
  const monthlyRate = params.expectedReturnRate / 1200;
  const goalContributionMap = new Map(
    (params.goalFundingPlan.goalStatuses ?? []).map((goal) => [goal.goalId, goal])
  );

  const roadmap: MonthlyRoadmapItem[] = [];
  let cumulativeCorpus = params.currentCorpus;
  let emergencyFundRemaining = Math.max(
    params.goalFundingPlan.emergencyFundMonthlyAllocation > 0
      ? params.goalFundingPlan.emergencyFundMonthlyAllocation * 12
      : 0,
    0
  );
  const cursor = new Date(startMonth);

  while (cursor <= endDate) {
    const isoMonth = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-01`;
    const monthLabel = cursor.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    });
    const goalSipContributions = params.goals
      .filter((goal) => goal.type !== "retirement")
      .map((goal) => {
        const targetDate = goal.targetDate ? new Date(goal.targetDate) : new Date(goal.targetYear, 11, 1);
        const status = goalContributionMap.get(goal.id);
        const active = cursor <= targetDate && (status?.recommendedMonthlySip ?? 0) > 0;

        return {
          goalId: goal.id,
          title: goal.title,
          amount: active ? round(status?.recommendedMonthlySip ?? 0) : 0
        };
      })
      .filter((goal) => goal.amount > 0);

    const emergencyFundContribution =
      emergencyFundRemaining > 0
        ? Math.min(params.goalFundingPlan.emergencyFundMonthlyAllocation, emergencyFundRemaining)
        : 0;
    emergencyFundRemaining = Math.max(emergencyFundRemaining - emergencyFundContribution, 0);

    const retirementSipContribution =
      cursor < retirementDate ? params.goalFundingPlan.retirementMonthlyAllocation : 0;
    const totalContribution =
      retirementSipContribution +
      emergencyFundContribution +
      sum(goalSipContributions.map((goal) => goal.amount));

    cumulativeCorpus =
      cumulativeCorpus * (1 + monthlyRate) + totalContribution;

    roadmap.push({
      isoMonth,
      monthLabel,
      retirementSipContribution: round(retirementSipContribution),
      goalSipContributions,
      emergencyFundContribution: round(emergencyFundContribution),
      insuranceAction:
        params.insuranceActions.length && roadmap.length < 3 ? params.insuranceActions[0] : undefined,
      taxOptimizationNote:
        params.taxOptimizationNote && [0, 9].includes(cursor.getMonth())
          ? params.taxOptimizationNote
          : undefined,
      expectedCumulativeCorpus: round(cumulativeCorpus),
      whyThisMonthLooksLikeThis:
        goalSipContributions.length > 0
          ? "Near-term goals and retirement are both being funded based on the monthly waterfall."
          : emergencyFundContribution > 0
            ? "Liquidity is being rebuilt before more surplus is sent to long-term investing."
            : "Most of this month’s planned investing can now flow toward retirement."
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return roadmap;
}

function buildYearlyRollups(monthlyRoadmap: MonthlyRoadmapItem[]): YearlyRoadmapRollup[] {
  const rollupMap = new Map<number, YearlyRoadmapRollup>();

  for (const item of monthlyRoadmap) {
    const year = Number(item.isoMonth.slice(0, 4));
    const current = rollupMap.get(year) ?? {
      year,
      retirementContribution: 0,
      goalContribution: 0,
      emergencyContribution: 0,
      projectedCorpus: 0,
      keyActions: []
    };

    current.retirementContribution += item.retirementSipContribution;
    current.goalContribution += sum(item.goalSipContributions.map((goal) => goal.amount));
    current.emergencyContribution += item.emergencyFundContribution;
    current.projectedCorpus = item.expectedCumulativeCorpus;

    if (item.insuranceAction && !current.keyActions.includes("Review insurance gap actions")) {
      current.keyActions.push("Review insurance gap actions");
    }

    if (item.taxOptimizationNote && !current.keyActions.includes("Review tax optimization")) {
      current.keyActions.push("Review tax optimization");
    }

    rollupMap.set(year, current);
  }

  return Array.from(rollupMap.values()).map((item) => ({
    ...item,
    retirementContribution: round(item.retirementContribution),
    goalContribution: round(item.goalContribution),
    emergencyContribution: round(item.emergencyContribution),
    projectedCorpus: round(item.projectedCorpus)
  }));
}

export function calculateFirePlan(input: FirePlanInput): FirePlanResult {
  const assumptionsUsed = [
    ...getAssumptionsForModule("fire"),
    ...getAssumptionsForModule("goals"),
    ...getAssumptionsForModule("insurance")
  ].filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const yearsToRetire = yearsBetween(input.age, input.retirementTargetAge);
  const currentCorpus = input.savings + input.investments;
  const annualExpenses = input.monthlyExpenses * 12;
  const annualExpensesAtRetirement =
    annualExpenses * (1 + input.expectedInflation / 100) ** yearsToRetire;
  const targetRetirementCorpus =
    annualExpensesAtRetirement * getRetirementCorpusMultiple();
  const monthlyAvailableForInvesting = Math.max(input.monthlyIncome - input.monthlyExpenses, 0);
  const emergencyFundTarget =
    input.monthlyExpenses *
    getEmergencyFundTargetMonths({
      dependents: input.dependents ?? 0,
      maritalStatus: input.maritalStatus,
      riskAppetite: input.riskAppetite
    });
  const rawRetirementMonthlySip = solveRequiredSip(
    targetRetirementCorpus,
    currentCorpus,
    input.expectedReturnRate,
    yearsToRetire
  );
  const insuranceAnalysis = calculateInsuranceGap(toPlannerProfile(input));
  const goalFundingPlan = buildGoalFundingPlan({
    lifeGoals: input.lifeGoals,
    expectedInflation: input.expectedInflation,
    riskAppetite: input.riskAppetite,
    monthlyAvailable: monthlyAvailableForInvesting,
    currentEmergencyFund: input.currentEmergencyFund ?? 0,
    emergencyFundTarget,
    insuranceAnalysis,
    retirementMonthlyNeed: rawRetirementMonthlySip
  });
  const projectedCorpus =
    futureValueLumpsum(currentCorpus, input.expectedReturnRate, yearsToRetire) +
    futureValueSip(goalFundingPlan.retirementMonthlyAllocation, input.expectedReturnRate, yearsToRetire);
  const onTrack = projectedCorpus >= targetRetirementCorpus;
  const yearByYearRoadmap: FireRoadmapItem[] = [];
  const annualContribution = goalFundingPlan.retirementMonthlyAllocation * 12;
  let corpusCursor = currentCorpus;

  for (let yearIndex = 1; yearIndex <= yearsToRetire; yearIndex += 1) {
    const year = new Date().getFullYear() + yearIndex;
    const age = input.age + yearIndex;
    const openingCorpus = corpusCursor;
    corpusCursor =
      futureValueLumpsum(corpusCursor, input.expectedReturnRate, 1) + annualContribution;

    yearByYearRoadmap.push({
      age,
      year,
      openingCorpus: round(openingCorpus),
      annualContribution: round(annualContribution),
      projectedCorpus: round(corpusCursor),
      inflationAdjustedExpense: round(
        annualExpenses * (1 + input.expectedInflation / 100) ** yearIndex
      )
    });
  }

  const taxOptimizationNote =
    input.salaryBreakdown && input.salaryBreakdown.section80c < 150000
      ? "Use remaining tax-saving room only if it fits liquidity and lock-in needs."
      : undefined;
  const monthlyRoadmap = buildMonthlyRoadmap({
    currentCorpus,
    expectedReturnRate: input.expectedReturnRate,
    age: input.age,
    retirementTargetAge: input.retirementTargetAge,
    goalFundingPlan,
    insuranceActions: insuranceAnalysis.recommendedActions,
    taxOptimizationNote,
    goals: input.lifeGoals,
    currentEmergencyFund: input.currentEmergencyFund ?? 0
  });
  const yearlyRollups = buildYearlyRollups(monthlyRoadmap);
  const assetAllocationGuidance = getAssetAllocationGuidance(
    input.age,
    input.retirementTargetAge
  );
  const annualSavingsRate = round(
    (monthlyAvailableForInvesting / Math.max(input.monthlyIncome, 1)) * 100,
    1
  );

  const fallbackSuggestions = [
    !onTrack
      ? `Current retirement funding is short by about Rs.${round(
          Math.max(rawRetirementMonthlySip - goalFundingPlan.retirementMonthlyAllocation, 0)
        ).toLocaleString("en-IN")} per month after urgent priorities are funded.`
      : "Retirement contributions are broadly aligned with the current target under these assumptions.",
    goalFundingPlan.underfundedItems[0] ??
      "No major goal is currently underfunded in the monthly waterfall.",
    goalFundingPlan.emergencyFundMonthlyAllocation > 0
      ? "Emergency-fund rebuilding is still absorbing part of your monthly surplus."
      : "Emergency reserves are not the main bottleneck right now.",
    "Review assumptions annually or sooner if inflation, salary, liabilities, or family needs change."
  ];

  const whatToDoNow = [
    goalFundingPlan.emergencyFundMonthlyAllocation > 0
      ? `Direct Rs.${goalFundingPlan.emergencyFundMonthlyAllocation.toLocaleString("en-IN")} this month to emergency cash.`
      : "Keep your emergency buffer intact while executing the rest of the plan.",
    insuranceAnalysis.recommendedActions[0],
    goalFundingPlan.goalStatuses.find((goal) => goal.status !== "funded")?.explanation ??
      "Continue the current goal contributions with annual step-ups.",
    onTrack
      ? "Increase retirement SIPs whenever income rises so future inflation shocks are easier to absorb."
      : `Raise retirement investing toward Rs.${round(rawRetirementMonthlySip).toLocaleString("en-IN")} if more surplus becomes available.`
  ];

  return {
    targetRetirementCorpus: round(targetRetirementCorpus),
    projectedCorpus: round(projectedCorpus),
    monthlySipRequired: round(rawRetirementMonthlySip),
    annualSavingsRate,
    onTrack,
    emergencyFundTarget: round(emergencyFundTarget),
    fallbackSuggestions,
    insuranceGapSuggestions: insuranceAnalysis.recommendedActions,
    yearByYearRoadmap,
    monthlyRoadmap,
    yearlyRollups,
    goalFundingPlan,
    assetAllocationGuidance,
    assumptionsUsed,
    confidence: {
      label: "estimated",
      score: 78,
      explanation:
        "Retirement, goal, and protection outputs are deterministic but still depend on forward-looking return and inflation assumptions.",
      lastUpdated: new Date().toISOString()
    },
    whatToDoNow,
    plainEnglishSummary: onTrack
      ? "You are broadly on track if you keep the current funding waterfall intact and revisit assumptions every year."
      : "Your current surplus is being stretched across emergency cash, protection gaps, goals, and retirement, so the retirement path still needs a stronger contribution rate."
  };
}
