import type {
  CouplePlannerInput,
  CouplePlannerResult,
  GoalOwnershipRecommendation,
  UserProfile
} from "@/lib/types";
import { getAssumptionsForModule } from "@/lib/config/finance-assumptions";
import { calculateInsuranceGap } from "@/lib/calculators/insurance";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import { currentNetWorth, monthlySurplus } from "@/lib/calculators/shared";
import { round } from "@/lib/utils";

function getCityType(profile: UserProfile) {
  if (profile.cityType === "metro") {
    return "metro";
  }

  return ["mumbai", "delhi", "kolkata", "chennai", "bengaluru", "bangalore"].includes(
    profile.city.toLowerCase()
  )
    ? "metro"
    : "non_metro";
}

function getTaxOutcome(profile: UserProfile) {
  return compareTaxRegimes({
    annualGrossSalary: profile.salaryBreakdown.annualGrossSalary,
    basicSalary: profile.salaryBreakdown.basicSalary,
    hraReceived: profile.salaryBreakdown.hraReceived,
    annualRentPaid: profile.monthlyExpenses * 12 * 0.55,
    cityType: getCityType(profile),
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
    sourceLabel: "Couple planner proxy"
  });
}

function assignGoalOwner(
  goalTitle: string,
  partnerA: UserProfile,
  partnerB: UserProfile,
  sharedMonthlyExpenses: number
): GoalOwnershipRecommendation {
  const surplusA = monthlySurplus(partnerA);
  const surplusB = monthlySurplus(partnerB);
  const higherSurplusPartner = surplusA >= surplusB ? "partnerA" : "partnerB";
  const jointFriendly =
    goalTitle.toLowerCase().includes("home") ||
    goalTitle.toLowerCase().includes("education") ||
    sharedMonthlyExpenses > 0;

  return {
    goalId: goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    goalTitle,
    owner: jointFriendly ? "joint" : higherSurplusPartner,
    reason:
      jointFriendly
        ? "This is a shared-life goal, so it should be tracked jointly even if contributions are split."
        : `Assigned to ${higherSurplusPartner} because that partner currently has the stronger free-cash position.`
  };
}

export function calculateCouplePlan(input: CouplePlannerInput): CouplePlannerResult {
  const assumptionsUsed = [
    ...getAssumptionsForModule("couple"),
    ...getAssumptionsForModule("insurance"),
    ...getAssumptionsForModule("tax")
  ];
  const combinedIncome = input.partnerA.monthlyIncome + input.partnerB.monthlyIncome;
  const combinedExpenses =
    input.partnerA.monthlyExpenses +
    input.partnerB.monthlyExpenses +
    input.partnerA.loanEmi +
    input.partnerB.loanEmi +
    input.sharedMonthlyExpenses;
  const combinedNetWorth = currentNetWorth(input.partnerA) + currentNetWorth(input.partnerB);
  const combinedSurplus = Math.max(combinedIncome - combinedExpenses, 0);
  const emergencyMonthsTarget =
    input.partnerA.dependents + input.partnerB.dependents > 0 ||
    input.partnerA.maritalStatus === "married" ||
    input.partnerB.maritalStatus === "married"
      ? 9
      : 6;
  const jointEmergencyFundTarget = round(combinedExpenses * emergencyMonthsTarget);

  const taxA = getTaxOutcome(input.partnerA);
  const taxB = getTaxOutcome(input.partnerB);
  const insuranceA = calculateInsuranceGap(input.partnerA);
  const insuranceB = calculateInsuranceGap(input.partnerB);
  const higherTaxImpactPartner =
    (taxA.rankedSuggestions[0]?.expectedTaxBenefit ?? 0) >=
    (taxB.rankedSuggestions[0]?.expectedTaxBenefit ?? 0)
      ? "partnerA"
      : "partnerB";
  const baselineJointSip = round(combinedSurplus * 0.7);
  const optimizedSipSplit =
    higherTaxImpactPartner === "partnerA"
      ? {
          partnerA: round(baselineJointSip * 0.6),
          partnerB: round(baselineJointSip * 0.4)
        }
      : {
          partnerA: round(baselineJointSip * 0.4),
          partnerB: round(baselineJointSip * 0.6)
        };

  const goalOwnershipMap = input.jointGoals.map((goal) =>
    assignGoalOwner(goal.title, input.partnerA, input.partnerB, input.sharedMonthlyExpenses)
  );
  const soloEmergencyFunds =
    (input.partnerA.monthlyExpenses + input.partnerA.loanEmi) * 6 +
    (input.partnerB.monthlyExpenses + input.partnerB.loanEmi) * 6;

  const scenarioComparisons = [
    {
      name: "Each partner keeps own deductions",
      combinedTax: round(Math.min(taxA.oldRegimeTax, taxA.newRegimeTax) + Math.min(taxB.oldRegimeTax, taxB.newRegimeTax)),
      monthlyInvestable: round(combinedSurplus * 0.65),
      rationale: "Base case using each partner’s current deduction profile."
    },
    {
      name: "Shift SIP ownership to higher tax-impact partner",
      combinedTax: round(
        Math.min(taxA.oldRegimeTax, taxA.newRegimeTax) +
          Math.min(taxB.oldRegimeTax, taxB.newRegimeTax) -
          Math.max(taxA.rankedSuggestions[0]?.expectedTaxBenefit ?? 0, taxB.rankedSuggestions[0]?.expectedTaxBenefit ?? 0) * 0.2
      ),
      monthlyInvestable: round(combinedSurplus * 0.7),
      rationale: `Allocate more tax-efficient investing to ${higherTaxImpactPartner} first.`
    },
    {
      name: "HRA-heavy optimization",
      combinedTax: round(
        Math.min(taxA.oldRegimeTax, taxA.newRegimeTax) +
          Math.min(taxB.oldRegimeTax, taxB.newRegimeTax) -
          (input.sharedMonthlyExpenses * 12 * 0.08)
      ),
      monthlyInvestable: round(combinedSurplus * 0.66),
      rationale: "Useful when one partner has meaningful HRA headroom and shared rent can be better aligned."
    },
    {
      name: "NPS-heavy optimization",
      combinedTax: round(
        Math.min(taxA.oldRegimeTax, taxA.newRegimeTax) +
          Math.min(taxB.oldRegimeTax, taxB.newRegimeTax) -
          ((taxA.rankedSuggestions.find((item) => item.name.includes("NPS"))?.expectedTaxBenefit ?? 0) +
            (taxB.rankedSuggestions.find((item) => item.name.includes("NPS"))?.expectedTaxBenefit ?? 0)) *
            0.3
      ),
      monthlyInvestable: round(combinedSurplus * 0.68),
      rationale: "Useful if both partners still have NPS headroom and long lock-in is acceptable."
    }
  ];

  return {
    combinedIncome: round(combinedIncome),
    combinedExpenses: round(combinedExpenses),
    combinedNetWorth: round(combinedNetWorth),
    combinedSurplus: round(combinedSurplus),
    jointEmergencyFundTarget,
    optimizedSipSplit,
    highLevelSuggestions: [
      `Assign more SIP ownership to ${higherTaxImpactPartner} because that partner currently has the higher incremental tax-saving upside.`,
      "Use one joint account for shared bills and one shared goals dashboard, but keep personal spending accounts separate.",
      goalOwnershipMap.length
        ? `Track joint goals explicitly: ${goalOwnershipMap.map((goal) => `${goal.goalTitle} -> ${goal.owner}`).join("; ")}.`
        : "Add at least one explicit joint goal so both partners know what shared surplus is meant to fund."
    ],
    insuranceSplitRecommendations: [
      insuranceA.healthCoverGap > 0 || insuranceB.healthCoverGap > 0
        ? "Use a family floater for shared medical needs, then add personal top-ups where employer cover is thin."
        : "Current health-cover structure is broadly workable, but keep one personally owned cover in force.",
      insuranceA.lifeCoverGap > insuranceB.lifeCoverGap
        ? `${input.partnerA.name} needs the bigger term-cover top-up because the protection gap is larger.`
        : `${input.partnerB.name} needs the bigger term-cover top-up because the protection gap is larger.`,
      "Mirror nominees, emergency contacts, and document access across both partners."
    ],
    soloVsJointDelta: {
      soloEmergencyFunds: round(soloEmergencyFunds),
      jointEmergencyFund: jointEmergencyFundTarget,
      monthlySurplusIncrease: round(combinedSurplus - monthlySurplus(input.partnerA) - monthlySurplus(input.partnerB))
    },
    scenarioComparisons,
    goalOwnershipMap,
    assumptionsUsed,
    confidence: {
      label: "estimated",
      score: 74,
      explanation:
        "Couple scenarios are deterministic, but they still rely on proxy shared-rent and contribution-allocation assumptions until exact household inputs are confirmed.",
      lastUpdated: new Date().toISOString()
    }
  };
}
