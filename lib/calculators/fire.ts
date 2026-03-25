import type {
  AllocationGuidance,
  FirePlanInput,
  FirePlanResult,
  FireRoadmapItem
} from "@/lib/types";
import {
  futureValueLumpsum,
  futureValueSip,
  solveRequiredSip,
  yearsBetween
} from "@/lib/calculators/shared";
import { round } from "@/lib/utils";

function getAssetAllocationGuidance(age: number, retirementAge: number): AllocationGuidance[] {
  const yearsToRetire = yearsBetween(age, retirementAge);
  const nowEquity = Math.max(40, Math.min(80, 100 - age));
  const preRetirementEquity = yearsToRetire <= 10 ? Math.max(35, nowEquity - 15) : Math.max(40, nowEquity - 10);

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

export function calculateFirePlan(input: FirePlanInput): FirePlanResult {
  const yearsToRetire = yearsBetween(input.age, input.retirementTargetAge);
  const currentCorpus = input.savings + input.investments;
  const annualExpenses = input.monthlyExpenses * 12;
  const annualExpensesAtRetirement = annualExpenses * (1 + input.expectedInflation / 100) ** yearsToRetire;

  // 25x annual expense uses a 4% withdrawal rule style approximation for a long retirement.
  const targetRetirementCorpus = annualExpensesAtRetirement * 25;
  const monthlyAvailableForInvesting = Math.max(input.monthlyIncome - input.monthlyExpenses, 0);
  const projectedCorpus =
    futureValueLumpsum(currentCorpus, input.expectedReturnRate, yearsToRetire) +
    futureValueSip(monthlyAvailableForInvesting, input.expectedReturnRate, yearsToRetire);
  const monthlySipRequired = solveRequiredSip(
    targetRetirementCorpus,
    currentCorpus,
    input.expectedReturnRate,
    yearsToRetire
  );
  const onTrack = projectedCorpus >= targetRetirementCorpus;
  const emergencyFundTarget = input.monthlyExpenses * (input.riskAppetite === "conservative" ? 9 : 6);

  const roadmap: FireRoadmapItem[] = [];
  const annualContribution = (onTrack ? monthlyAvailableForInvesting : Math.max(monthlySipRequired, monthlyAvailableForInvesting)) * 12;
  let corpusCursor = currentCorpus;

  for (let yearIndex = 1; yearIndex <= yearsToRetire; yearIndex += 1) {
    const year = new Date().getFullYear() + yearIndex;
    const age = input.age + yearIndex;
    const openingCorpus = corpusCursor;
    corpusCursor = futureValueLumpsum(corpusCursor, input.expectedReturnRate, 1) + annualContribution;

    roadmap.push({
      age,
      year,
      openingCorpus: round(openingCorpus),
      annualContribution: round(annualContribution),
      projectedCorpus: round(corpusCursor),
      inflationAdjustedExpense: round(annualExpenses * (1 + input.expectedInflation / 100) ** yearIndex)
    });
  }

  const fallbackSuggestions = [
    !onTrack
      ? `Increase monthly investing by about ₹${Math.max(monthlySipRequired - monthlyAvailableForInvesting, 0).toFixed(0)}.`
      : "Keep your current surplus invested and increase SIPs whenever salary grows.",
    monthlyAvailableForInvesting < monthlySipRequired
      ? "Trim recurring expenses by 5% to 10% and route the difference into index or flexi-cap SIPs."
      : "Direct annual bonuses and appraisals toward retirement instead of lifestyle inflation.",
    input.retirementTargetAge < 50 && !onTrack
      ? "Delaying retirement by 2 to 3 years can sharply reduce the required monthly SIP."
      : "Review goals every 12 months and reset assumptions if inflation or returns change."
  ];

  const insuranceGapSuggestions = [
    `Suggested term cover baseline: around ₹${Math.round(input.monthlyIncome * 12 * 15).toLocaleString("en-IN")}.`,
    "Maintain family health insurance of at least ₹10 lakh with a super-top-up if dependents rely on you.",
    "Keep disability and personal accident cover active while you are in the accumulation phase."
  ];

  const assetAllocationGuidance = getAssetAllocationGuidance(input.age, input.retirementTargetAge);
  const annualSavingsRate = round((monthlyAvailableForInvesting / Math.max(input.monthlyIncome, 1)) * 100, 1);

  return {
    targetRetirementCorpus: round(targetRetirementCorpus),
    projectedCorpus: round(projectedCorpus),
    monthlySipRequired: round(monthlySipRequired),
    annualSavingsRate,
    onTrack,
    emergencyFundTarget: round(emergencyFundTarget),
    fallbackSuggestions,
    insuranceGapSuggestions,
    yearByYearRoadmap: roadmap,
    assetAllocationGuidance,
    plainEnglishSummary: onTrack
      ? "You are broadly on track for your retirement target if you keep today’s surplus invested with discipline."
      : "Your current trajectory falls short of the target corpus, so you need a higher SIP, lower expenses, or a later retirement age."
  };
}
