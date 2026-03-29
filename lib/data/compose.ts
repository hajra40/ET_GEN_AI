import type {
  InsightPromptContext,
  UserProfile
} from "@/lib/types";
import {
  getInflationDefault,
  getRiskAdjustedReturn
} from "@/lib/config/finance-assumptions";
import { calculateMoneyHealthScore } from "@/lib/calculators/money-health";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import { calculatePortfolioXRay } from "@/lib/calculators/portfolio";
import { getPortfolioByEmail } from "@/lib/data/store";
import { getMetroCityFlag, totalInvestments } from "@/lib/calculators/shared";

export async function buildInsightContext(profile: UserProfile): Promise<InsightPromptContext> {
  const moneyHealth = calculateMoneyHealthScore(profile);
  const firePlan = calculateFirePlan({
    age: profile.age,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
    savings: profile.currentSavings,
    investments: totalInvestments(profile.currentInvestments),
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
  const taxResult = compareTaxRegimes({
    annualGrossSalary: profile.salaryBreakdown.annualGrossSalary,
    basicSalary: profile.salaryBreakdown.basicSalary,
    hraReceived: profile.salaryBreakdown.hraReceived,
    annualRentPaid: profile.monthlyExpenses * (getMetroCityFlag(profile.city) ? 4.2 : 3.2),
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
    sourceLabel: "Insight context proxy"
  });
  const portfolioXRay = calculatePortfolioXRay(await getPortfolioByEmail(profile.email));

  return {
    profile,
    moneyHealth,
    firePlan,
    taxResult,
    portfolioXRay
  };
}
