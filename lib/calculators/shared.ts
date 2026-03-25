import type {
  InvestmentBreakdown,
  UserProfile
} from "@/lib/types";
import { round, sum } from "@/lib/utils";

export function totalInvestments(investments: InvestmentBreakdown) {
  return sum(Object.values(investments));
}

export function currentNetWorth(profile: UserProfile) {
  return profile.currentSavings + totalInvestments(profile.currentInvestments);
}

export function monthlySurplus(profile: UserProfile) {
  return Math.max(profile.monthlyIncome - profile.monthlyExpenses - profile.loanEmi, 0);
}

export function monthlyObligation(profile: UserProfile) {
  return profile.monthlyExpenses + profile.loanEmi;
}

export function futureValueLumpsum(principal: number, annualRatePercent: number, years: number) {
  const annualRate = annualRatePercent / 100;
  return principal * (1 + annualRate) ** years;
}

export function futureValueSip(monthlyContribution: number, annualRatePercent: number, years: number) {
  if (monthlyContribution <= 0 || years <= 0) {
    return 0;
  }

  const monthlyRate = annualRatePercent / 1200;
  const months = years * 12;

  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }

  return monthlyContribution * ((((1 + monthlyRate) ** months) - 1) / monthlyRate) * (1 + monthlyRate);
}

export function solveRequiredSip(targetCorpus: number, currentCorpus: number, annualRatePercent: number, years: number) {
  const corpusFromExisting = futureValueLumpsum(currentCorpus, annualRatePercent, years);
  const shortfall = Math.max(targetCorpus - corpusFromExisting, 0);

  if (shortfall === 0 || years <= 0) {
    return 0;
  }

  const monthlyRate = annualRatePercent / 1200;
  const months = years * 12;

  if (monthlyRate === 0) {
    return shortfall / months;
  }

  const annuityFactor = ((((1 + monthlyRate) ** months) - 1) / monthlyRate) * (1 + monthlyRate);
  return shortfall / annuityFactor;
}

export function yearsBetween(currentAge: number, targetAge: number) {
  return Math.max(targetAge - currentAge, 1);
}

export function getMetroCityFlag(city: string) {
  return ["mumbai", "delhi", "kolkata", "chennai", "bengaluru", "bangalore"].includes(city.toLowerCase());
}

export function ratioPercent(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return round((part / total) * 100, 1);
}

export function annualizeMonthly(amount: number) {
  return amount * 12;
}
