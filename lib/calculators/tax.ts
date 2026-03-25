import type {
  TaxSavingSuggestion,
  TaxWizardInput,
  TaxWizardResult
} from "@/lib/types";
import { clamp, round } from "@/lib/utils";

const OLD_SLABS = [
  { upto: 250000, rate: 0 },
  { upto: 500000, rate: 0.05 },
  { upto: 1000000, rate: 0.2 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
];

const NEW_SLABS_AY_2026_27 = [
  { upto: 400000, rate: 0 },
  { upto: 800000, rate: 0.05 },
  { upto: 1200000, rate: 0.1 },
  { upto: 1600000, rate: 0.15 },
  { upto: 2000000, rate: 0.2 },
  { upto: 2400000, rate: 0.25 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
];

function computeTaxFromSlabs(taxableIncome: number, slabs: { upto: number; rate: number }[]) {
  let previousLimit = 0;
  let tax = 0;

  for (const slab of slabs) {
    if (taxableIncome <= previousLimit) {
      break;
    }

    const taxableInThisSlab = Math.min(taxableIncome, slab.upto) - previousLimit;
    tax += taxableInThisSlab * slab.rate;
    previousLimit = slab.upto;
  }

  return tax;
}

function applyRebateWithMarginalRelief(taxableIncome: number, tax: number, threshold: number, maxRebate: number) {
  if (taxableIncome <= threshold) {
    return Math.min(tax, maxRebate);
  }

  const excessIncome = taxableIncome - threshold;
  if (tax > excessIncome) {
    return Math.min(tax - excessIncome, maxRebate);
  }

  return 0;
}

function calculateHraExemption(input: TaxWizardInput) {
  if (input.annualRentPaid <= 0 || input.hraReceived <= 0) {
    return 0;
  }

  const salaryForHra = input.basicSalary;
  const metroLimit = input.cityType === "metro" ? 0.5 : 0.4;

  return Math.max(
    0,
    Math.min(
      input.hraReceived,
      input.annualRentPaid - 0.1 * salaryForHra,
      salaryForHra * metroLimit
    )
  );
}

function getMarginalRate(taxableIncome: number) {
  if (taxableIncome > 1000000) {
    return 0.3;
  }

  if (taxableIncome > 500000) {
    return 0.2;
  }

  if (taxableIncome > 250000) {
    return 0.05;
  }

  return 0;
}

export function compareTaxRegimes(input: TaxWizardInput): TaxWizardResult {
  const grossSalary = input.annualGrossSalary + input.bonus;
  const hraExemption = calculateHraExemption(input);
  const capped80c = clamp(input.section80c, 0, 150000);
  const capped80d = clamp(input.section80d, 0, 25000);
  const cappedNpsEmployee = clamp(input.npsEmployee, 0, 50000);
  const cappedHomeLoanInterest = clamp(input.homeLoanInterest, 0, 200000);
  const oldDeductions =
    50000 +
    hraExemption +
    input.professionalTax +
    capped80c +
    capped80d +
    cappedNpsEmployee +
    cappedHomeLoanInterest +
    clamp(input.otherDeductions, 0, 50000);

  const employerNpsAllowed = clamp(input.npsEmployer, 0, input.basicSalary * 0.14);
  const oldTaxableIncome = Math.max(grossSalary - oldDeductions, 0);
  const newTaxableIncome = Math.max(grossSalary - 75000 - employerNpsAllowed, 0);

  let oldRegimeTax = computeTaxFromSlabs(oldTaxableIncome, OLD_SLABS);
  oldRegimeTax -= applyRebateWithMarginalRelief(oldTaxableIncome, oldRegimeTax, 500000, 12500);
  oldRegimeTax = Math.max(oldRegimeTax, 0) * 1.04;

  let newRegimeTax = computeTaxFromSlabs(newTaxableIncome, NEW_SLABS_AY_2026_27);
  newRegimeTax -= applyRebateWithMarginalRelief(newTaxableIncome, newRegimeTax, 1200000, 60000);
  newRegimeTax = Math.max(newRegimeTax, 0) * 1.04;

  const bestRegime = oldRegimeTax <= newRegimeTax ? "old" : "new";
  const savingsDifference = round(Math.abs(oldRegimeTax - newRegimeTax));
  const marginalRate = getMarginalRate(oldTaxableIncome);
  const remaining80c = Math.max(150000 - capped80c, 0);
  const remaining80d = Math.max(25000 - capped80d, 0);
  const remainingNps = Math.max(50000 - cappedNpsEmployee, 0);

  const rankedSuggestions: TaxSavingSuggestion[] = [
    {
      name: "Top up Section 80C with ELSS, PPF, or EPF",
      risk: "medium" as const,
      liquidity: "low" as const,
      lockIn: "3 to 15 years",
      expectedTaxBenefit: round(remaining80c * marginalRate),
      notes: "Best for users who are staying in the old regime and have 80C room left."
    },
    {
      name: "Use NPS Section 80CCD(1B)",
      risk: "medium" as const,
      liquidity: "low" as const,
      lockIn: "Till retirement",
      expectedTaxBenefit: round(remainingNps * marginalRate),
      notes: "Can add up to ₹50,000 deduction above the normal 80C limit in the old regime."
    },
    {
      name: "Upgrade health cover for Section 80D",
      risk: "low" as const,
      liquidity: "medium" as const,
      lockIn: "1 year renewable",
      expectedTaxBenefit: round(remaining80d * marginalRate),
      notes: "Useful when protection is thin and 80D is not fully utilized."
    },
    {
      name: "Ask employer to structure NPS contribution",
      risk: "low" as const,
      liquidity: "low" as const,
      lockIn: "Till retirement",
      expectedTaxBenefit: round(employerNpsAllowed * 0.3),
      notes: "Employer NPS can remain useful even under the new regime."
    }
  ].sort((left, right) => right.expectedTaxBenefit - left.expectedTaxBenefit);

  const missedDeductions = [
    remaining80c > 0 ? `Section 80C room left: ₹${remaining80c.toLocaleString("en-IN")}` : "",
    remaining80d > 0 ? `Section 80D room left: ₹${remaining80d.toLocaleString("en-IN")}` : "",
    remainingNps > 0 ? `NPS add-on room left: ₹${remainingNps.toLocaleString("en-IN")}` : ""
  ].filter(Boolean);

  return {
    oldRegimeTax: round(oldRegimeTax),
    newRegimeTax: round(newRegimeTax),
    bestRegime,
    savingsDifference,
    oldTaxableIncome: round(oldTaxableIncome),
    newTaxableIncome: round(newTaxableIncome),
    missedDeductions,
    rankedSuggestions,
    explanation:
      bestRegime === "old"
        ? "The old regime currently wins because your deductions and exemptions are meaningful enough to outweigh the lower new-regime slab rates."
        : "The new regime currently wins because your deduction usage is not high enough to beat the lower slab structure and higher rebate threshold."
  };
}
