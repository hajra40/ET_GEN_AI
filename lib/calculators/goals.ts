import {
  getAssumptionsForModule,
  getGoalBucketForHorizon
} from "@/lib/config/finance-assumptions";
import {
  futureValueLumpsum,
  solveRequiredSip
} from "@/lib/calculators/shared";
import type {
  Goal,
  GoalAllocationDecision,
  GoalFundingPlan,
  GoalFundingStatus,
  InsuranceGapAnalysis,
  RiskAppetite
} from "@/lib/types";
import { round } from "@/lib/utils";

interface GoalEngineInput {
  lifeGoals: Goal[];
  expectedInflation: number;
  riskAppetite: RiskAppetite;
  monthlyAvailable: number;
  currentEmergencyFund: number;
  emergencyFundTarget: number;
  insuranceAnalysis?: InsuranceGapAnalysis;
  retirementMonthlyNeed: number;
  now?: Date;
}

function monthsUntil(targetDate: string, now: Date) {
  const target = new Date(targetDate);
  return Math.max(
    (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth(),
    1
  );
}

function getTargetDate(goal: Goal) {
  if (goal.targetDate) {
    return goal.targetDate;
  }

  return `${goal.targetYear}-12-01`;
}

function getPriorityRank(goal: Goal) {
  if (goal.priority === "high") {
    return 1;
  }

  if (goal.priority === "medium") {
    return 2;
  }

  return 3;
}

function estimateInsuranceMonthlyBuffer(insuranceAnalysis?: InsuranceGapAnalysis) {
  if (!insuranceAnalysis) {
    return 0;
  }

  const totalGap =
    insuranceAnalysis.healthCoverGap +
    insuranceAnalysis.disabilityCoverGap +
    insuranceAnalysis.personalAccidentCoverGap;

  if (totalGap <= 0 && insuranceAnalysis.lifeCoverGap <= 0) {
    return 0;
  }

  const provisionalAnnualPremium =
    insuranceAnalysis.lifeCoverGap * 0.001 +
    insuranceAnalysis.healthCoverGap * 0.03 +
    insuranceAnalysis.disabilityCoverGap * 0.004 +
    insuranceAnalysis.personalAccidentCoverGap * 0.002;

  return Math.max(round(provisionalAnnualPremium / 12), 1500);
}

export function buildGoalFundingPlan(input: GoalEngineInput): GoalFundingPlan {
  const assumptionsUsed = getAssumptionsForModule("goals");
  const now = input.now ?? new Date();
  const nonRetirementGoals = input.lifeGoals.filter((goal) => goal.type !== "retirement");
  const sortedGoals = [...nonRetirementGoals].sort((left, right) => {
    const priorityDelta = getPriorityRank(left) - getPriorityRank(right);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return monthsUntil(getTargetDate(left), now) - monthsUntil(getTargetDate(right), now);
  });

  const emergencyGap = Math.max(input.emergencyFundTarget - input.currentEmergencyFund, 0);
  const emergencyFundMonthlyAllocation =
    emergencyGap > 0 ? Math.min(round(emergencyGap / 12), input.monthlyAvailable) : 0;
  let remaining = Math.max(input.monthlyAvailable - emergencyFundMonthlyAllocation, 0);

  const insuranceMonthlyAllocation = Math.min(
    estimateInsuranceMonthlyBuffer(input.insuranceAnalysis),
    remaining
  );
  remaining = Math.max(remaining - insuranceMonthlyAllocation, 0);

  const waterfall: GoalAllocationDecision[] = [];
  if (emergencyFundMonthlyAllocation > 0) {
    waterfall.push({
      bucket: "emergency_fund",
      label: "Emergency fund",
      requiredAmount: round(emergencyGap / 12),
      allocatedAmount: emergencyFundMonthlyAllocation,
      shortfall: Math.max(round(emergencyGap / 12) - emergencyFundMonthlyAllocation, 0),
      rationale: "Emergency liquidity is funded before long-term investing.",
      priority: 1
    });
  }

  if (insuranceMonthlyAllocation > 0) {
    waterfall.push({
      bucket: "insurance",
      label: "Insurance gap minimums",
      requiredAmount: estimateInsuranceMonthlyBuffer(input.insuranceAnalysis),
      allocatedAmount: insuranceMonthlyAllocation,
      shortfall: Math.max(
        estimateInsuranceMonthlyBuffer(input.insuranceAnalysis) - insuranceMonthlyAllocation,
        0
      ),
      rationale: "Protection gaps should be addressed before stretching for additional market risk.",
      priority: 2
    });
  }

  const goalStatuses: GoalFundingStatus[] = [];
  const deferredGoals: GoalFundingStatus[] = [];

  for (const goal of sortedGoals) {
    const targetDate = getTargetDate(goal);
    const horizonMonths = monthsUntil(targetDate, now);
    const horizonYears = horizonMonths / 12;
    const bucket = getGoalBucketForHorizon(horizonMonths, input.riskAppetite);
    const currentProgress = goal.currentAmount ?? goal.allocatedAmount ?? 0;
    const lumpSumAllocated = goal.allocatedAmount ?? 0;
    const targetAmountToday = goal.targetAmount;
    const inflationAdjustedFutureValue = futureValueLumpsum(
      targetAmountToday,
      input.expectedInflation,
      horizonYears
    );
    const requiredMonthlySip = solveRequiredSip(
      inflationAdjustedFutureValue,
      currentProgress + lumpSumAllocated,
      bucket.expectedReturn,
      horizonYears
    );

    const status: GoalFundingStatus = {
      goalId: goal.id,
      title: goal.title,
      type: goal.type,
      priority: goal.priority,
      targetAmountToday: round(targetAmountToday),
      inflationAdjustedFutureValue: round(inflationAdjustedFutureValue),
      currentProgress: round(currentProgress),
      currentProgressPercent:
        inflationAdjustedFutureValue <= 0
          ? 0
          : round((currentProgress / inflationAdjustedFutureValue) * 100, 1),
      lumpSumAllocated: round(lumpSumAllocated),
      requiredMonthlySip: round(requiredMonthlySip),
      recommendedMonthlySip: 0,
      shortfall: round(requiredMonthlySip),
      horizonMonths,
      targetDate,
      recommendedAssetBucket: `${bucket.label}: ${bucket.assetMix}`,
      status: "deferred",
      explanation: "This goal has not yet been allocated a monthly contribution."
    };

    const isHighPriorityShortTerm = goal.priority === "high" && horizonMonths <= 60;
    if (isHighPriorityShortTerm) {
      const allocated = Math.min(requiredMonthlySip, remaining);
      remaining = Math.max(remaining - allocated, 0);
      status.recommendedMonthlySip = round(allocated);
      status.shortfall = round(Math.max(requiredMonthlySip - allocated, 0));
      status.status =
        allocated >= requiredMonthlySip ? "funded" : allocated > 0 ? "partially_funded" : "underfunded";
      status.explanation =
        allocated >= requiredMonthlySip
          ? "Fully covered in the current waterfall because it is both near-term and high priority."
          : allocated > 0
            ? "Partially covered first because it is near-term and high priority."
            : "High-priority goal remains underfunded because emergency and protection needs consume current surplus.";

      waterfall.push({
        bucket: "goal",
        label: goal.title,
        referenceId: goal.id,
        requiredAmount: round(requiredMonthlySip),
        allocatedAmount: round(allocated),
        shortfall: round(Math.max(requiredMonthlySip - allocated, 0)),
        rationale: "High-priority short-term goals are funded before retirement top-ups.",
        priority: 3
      });

      goalStatuses.push(status);
      continue;
    }

    deferredGoals.push(status);
  }

  const retirementMonthlyAllocation = Math.min(input.retirementMonthlyNeed, remaining);
  remaining = Math.max(remaining - retirementMonthlyAllocation, 0);

  waterfall.push({
    bucket: "retirement",
    label: "Retirement investing",
    requiredAmount: round(input.retirementMonthlyNeed),
    allocatedAmount: round(retirementMonthlyAllocation),
    shortfall: round(Math.max(input.retirementMonthlyNeed - retirementMonthlyAllocation, 0)),
    rationale: "Retirement comes after emergency, protection, and urgent goals in the monthly waterfall.",
    priority: 4
  });

  for (const goalStatus of deferredGoals) {
    const allocated = Math.min(goalStatus.requiredMonthlySip, remaining);
    remaining = Math.max(remaining - allocated, 0);
    goalStatus.recommendedMonthlySip = round(allocated);
    goalStatus.shortfall = round(Math.max(goalStatus.requiredMonthlySip - allocated, 0));
    goalStatus.status =
      allocated >= goalStatus.requiredMonthlySip
        ? "funded"
        : allocated > 0
          ? "partially_funded"
          : "underfunded";
    goalStatus.explanation =
      allocated >= goalStatus.requiredMonthlySip
        ? "Fully funded after urgent goals and retirement needs were allocated."
        : allocated > 0
          ? "Partially funded after urgent goals and retirement needs were allocated."
          : "Deferred because higher-priority needs consumed the current monthly surplus.";

    waterfall.push({
      bucket: "goal",
      label: goalStatus.title,
      referenceId: goalStatus.goalId,
      requiredAmount: goalStatus.requiredMonthlySip,
      allocatedAmount: goalStatus.recommendedMonthlySip,
      shortfall: goalStatus.shortfall,
      rationale: "Medium- and low-priority goals are funded after urgent goals and retirement.",
      priority: 5
    });
    goalStatuses.push(goalStatus);
  }

  const underfundedItems = [
    ...goalStatuses
      .filter((goal) => goal.shortfall > 0)
      .map((goal) => `${goal.title} short by Rs.${goal.shortfall.toLocaleString("en-IN")} per month`),
    ...(retirementMonthlyAllocation < input.retirementMonthlyNeed
      ? [
          `Retirement short by Rs.${round(
            input.retirementMonthlyNeed - retirementMonthlyAllocation
          ).toLocaleString("en-IN")} per month`
        ]
      : [])
  ];

  return {
    monthlyAvailable: round(input.monthlyAvailable),
    emergencyFundMonthlyAllocation: round(emergencyFundMonthlyAllocation),
    insuranceMonthlyAllocation: round(insuranceMonthlyAllocation),
    retirementMonthlyAllocation: round(retirementMonthlyAllocation),
    goalStatuses: goalStatuses.sort((left, right) => {
      const priorityDelta = getPriorityRank({
        id: left.goalId,
        title: left.title,
        targetAmount: left.targetAmountToday,
        targetYear: Number(left.targetDate.slice(0, 4)),
        priority: left.priority,
        type: left.type
      }) - getPriorityRank({
        id: right.goalId,
        title: right.title,
        targetAmount: right.targetAmountToday,
        targetYear: Number(right.targetDate.slice(0, 4)),
        priority: right.priority,
        type: right.type
      });

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.horizonMonths - right.horizonMonths;
    }),
    waterfall,
    underfundedItems,
    assumptionsUsed
  };
}
