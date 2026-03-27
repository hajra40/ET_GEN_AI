import type {
  InsightPromptContext,
  UserProfile
} from "@/lib/types";
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
    expectedInflation: 6,
    expectedReturnRate: profile.riskAppetite === "aggressive" ? 12 : profile.riskAppetite === "growth" ? 11 : 9,
    lifeGoals: profile.financialGoals,
    riskAppetite: profile.riskAppetite
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
    otherDeductions: profile.salaryBreakdown.otherDeductions
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
