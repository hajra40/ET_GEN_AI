import type {
  CouplePlannerInput,
  CouplePlannerResult
} from "@/lib/types";
import { currentNetWorth, monthlySurplus } from "@/lib/calculators/shared";
import { round } from "@/lib/utils";

export function calculateCouplePlan(input: CouplePlannerInput): CouplePlannerResult {
  const combinedIncome = input.partnerA.monthlyIncome + input.partnerB.monthlyIncome;
  const combinedExpenses =
    input.partnerA.monthlyExpenses +
    input.partnerB.monthlyExpenses +
    input.partnerA.loanEmi +
    input.partnerB.loanEmi +
    input.sharedMonthlyExpenses;
  const combinedNetWorth = currentNetWorth(input.partnerA) + currentNetWorth(input.partnerB);
  const combinedSurplus = Math.max(combinedIncome - combinedExpenses, 0);
  const incomeWeightA = input.partnerA.monthlyIncome / Math.max(combinedIncome, 1);
  const jointEmergencyFundTarget = round(combinedExpenses * 9);
  const targetJointSip = round(combinedSurplus * 0.75);
  const optimizedSipSplit = {
    partnerA: round(targetJointSip * incomeWeightA),
    partnerB: round(targetJointSip * (1 - incomeWeightA))
  };
  const soloEmergencyFunds =
    (input.partnerA.monthlyExpenses + input.partnerA.loanEmi) * 6 +
    (input.partnerB.monthlyExpenses + input.partnerB.loanEmi) * 6;

  return {
    combinedIncome: round(combinedIncome),
    combinedExpenses: round(combinedExpenses),
    combinedNetWorth: round(combinedNetWorth),
    jointEmergencyFundTarget,
    optimizedSipSplit,
    highLevelSuggestions: [
      "Use one joint account for shared bills and keep a separate account for personal discretionary spending.",
      "If one partner is in a higher slab, maximize the employer NPS, HRA, and deduction structure there first.",
      "Map joint goals with owners, target dates, and fallback rules so no goal is mentally unowned."
    ],
    insuranceSplitRecommendations: [
      "Use family floater health cover for shared needs and separate top-ups if one partner has employer cover gaps.",
      "Term cover should broadly match each partner’s income replacement need and debt responsibility.",
      "Nominee details, emergency contacts, and document access should be mirrored across both partners."
    ],
    soloVsJointDelta: {
      soloEmergencyFunds: round(soloEmergencyFunds),
      jointEmergencyFund: jointEmergencyFundTarget,
      monthlySurplusIncrease: round(combinedSurplus - monthlySurplus(input.partnerA) - monthlySurplus(input.partnerB))
    }
  };
}
