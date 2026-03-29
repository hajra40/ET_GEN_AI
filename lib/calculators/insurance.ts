import {
  getAssumptionsForModule
} from "@/lib/config/finance-assumptions";
import type {
  CityType,
  EmployerBenefits,
  InsuranceCoverage,
  InsuranceGapAnalysis,
  UserProfile
} from "@/lib/types";
import { round, sum } from "@/lib/utils";

function resolveCityType(profile: UserProfile): CityType {
  if (profile.cityType) {
    return profile.cityType;
  }

  const metroCities = new Set(["mumbai", "delhi", "kolkata", "chennai", "bengaluru", "bangalore"]);
  return metroCities.has(profile.city.toLowerCase()) ? "metro" : "non_metro";
}

function getEmployerBenefits(profile: UserProfile): EmployerBenefits {
  return {
    employerHealthCover: profile.employerBenefits?.employerHealthCover ?? 0,
    employerLifeCover: profile.employerBenefits?.employerLifeCover ?? 0,
    employerDisabilityCover: profile.employerBenefits?.employerDisabilityCover ?? 0,
    employerAccidentCover: profile.employerBenefits?.employerAccidentCover ?? 0,
    npsEmployerAvailable: profile.employerBenefits?.npsEmployerAvailable ?? profile.salaryBreakdown.npsEmployer > 0
  };
}

function getOutstandingLiabilities(profile: UserProfile) {
  if (profile.debtDetails?.length) {
    return sum(profile.debtDetails.map((debt) => debt.outstandingAmount));
  }

  return 0;
}

export function calculateInsuranceGap(profile: UserProfile): InsuranceGapAnalysis {
  const assumptionsUsed = getAssumptionsForModule("insurance");
  const employerBenefits = getEmployerBenefits(profile);
  const cityType = resolveCityType(profile);
  const annualIncome = profile.monthlyIncome * 12;
  const dependents = Math.max(profile.dependents, 0);
  const liabilities = getOutstandingLiabilities(profile);
  const missingInputs: string[] = [];
  const coverage: InsuranceCoverage = profile.insuranceCoverage;

  if (!profile.debtDetails?.length && profile.loanEmi > 0) {
    missingInputs.push("Outstanding loan balances are missing, so liabilities may be understated.");
  }

  const lifeIncomeMultiple = Number(
    assumptionsUsed.find((item) => item.id === "life-cover-income-multiple")?.value ?? 12
  );
  const dependentReserve = Number(
    assumptionsUsed.find((item) => item.id === "dependent-reserve")?.value ?? 500000
  );
  const disabilityMultiple = Number(
    assumptionsUsed.find((item) => item.id === "disability-income-multiple")?.value ?? 5
  );
  const accidentMultiple = Number(
    assumptionsUsed.find((item) => item.id === "accident-income-multiple")?.value ?? 6
  );
  const healthSingle = Number(
    assumptionsUsed.find((item) => item.id === "health-cover-single")?.value ?? 500000
  );
  const healthFamily = Number(
    assumptionsUsed.find((item) => item.id === "health-cover-family")?.value ?? 1000000
  );
  const metroAddOn = Number(
    assumptionsUsed.find((item) => item.id === "metro-health-cover-add-on")?.value ?? 250000
  );

  const lifeCoverTarget = annualIncome * lifeIncomeMultiple + liabilities + dependents * dependentReserve;
  const healthBaseTarget =
    dependents > 0 || profile.maritalStatus === "married" ? healthFamily : healthSingle;
  const healthCoverTarget =
    healthBaseTarget + (cityType === "metro" || cityType === "tier_1" ? metroAddOn : 0);
  const disabilityCoverTarget = annualIncome * disabilityMultiple;
  const personalAccidentCoverTarget = annualIncome * accidentMultiple;

  const lifeCoverExisting = coverage.lifeCover + employerBenefits.employerLifeCover;
  const healthCoverExisting = coverage.healthCover + employerBenefits.employerHealthCover;
  const disabilityCoverExisting =
    coverage.disabilityCover + employerBenefits.employerDisabilityCover;
  const accidentCoverExisting =
    coverage.personalAccidentCover + employerBenefits.employerAccidentCover;

  const lifeCoverGap = Math.max(lifeCoverTarget - lifeCoverExisting, 0);
  const healthCoverGap = Math.max(healthCoverTarget - healthCoverExisting, 0);
  const disabilityCoverGap = Math.max(disabilityCoverTarget - disabilityCoverExisting, 0);
  const personalAccidentCoverGap = Math.max(
    personalAccidentCoverTarget - accidentCoverExisting,
    0
  );

  const recommendedActions = [
    lifeCoverGap > 0
      ? `Buy or top up term cover by roughly Rs.${round(lifeCoverGap).toLocaleString("en-IN")} to protect income replacement and liabilities.`
      : "Life cover looks broadly adequate against the current income-replacement estimate.",
    healthCoverGap > 0
      ? coverage.healthCover === 0 && employerBenefits.employerHealthCover > 0
        ? "Do not rely only on employer health cover. Add a personal or family floater plus a top-up."
        : `Raise health cover by roughly Rs.${round(healthCoverGap).toLocaleString("en-IN")} through a floater and top-up structure.`
      : "Health cover is broadly aligned with the baseline family-size and city-tier target.",
    disabilityCoverGap > 0 || personalAccidentCoverGap > 0
      ? "Add standalone personal accident and disability cover instead of assuming health insurance is enough."
      : "Personal accident and disability cover are present at a reasonable starting level.",
    "Review nominees, emergency contacts, and policy ownership across all active insurance policies."
  ];

  return {
    lifeCoverTarget: round(lifeCoverTarget),
    lifeCoverGap: round(lifeCoverGap),
    healthCoverTarget: round(healthCoverTarget),
    healthCoverGap: round(healthCoverGap),
    disabilityCoverTarget: round(disabilityCoverTarget),
    disabilityCoverGap: round(disabilityCoverGap),
    personalAccidentCoverTarget: round(personalAccidentCoverTarget),
    personalAccidentCoverGap: round(personalAccidentCoverGap),
    recommendedActions,
    assumptionsUsed,
    missingInputs
  };
}
