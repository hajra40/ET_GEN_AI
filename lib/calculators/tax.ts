import type {
  TaxSavingSuggestion,
  TaxWizardInput,
  TaxWizardResult
} from "@/lib/types";
import { getTaxRules } from "@/lib/config/tax-rules";
import { clamp, round } from "@/lib/utils";

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

function applyRebateWithMarginalRelief(
  taxableIncome: number,
  tax: number,
  threshold: number,
  maxRebate: number
) {
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
  if (input.annualRentPaid <= 0 || input.hraReceived <= 0 || input.basicSalary <= 0) {
    return 0;
  }

  const metroLimit = input.cityType === "metro" ? 0.5 : 0.4;

  return Math.max(
    0,
    Math.min(
      input.hraReceived,
      input.annualRentPaid - 0.1 * input.basicSalary,
      input.basicSalary * metroLimit
    )
  );
}

function getMarginalRate(taxableIncome: number, slabs: { upto: number; rate: number }[]) {
  let previousLimit = 0;
  for (const slab of slabs) {
    if (taxableIncome <= slab.upto) {
      return slab.rate;
    }

    previousLimit = slab.upto;
  }

  return slabs[slabs.length - 1]?.rate ?? 0;
}

function getLiquidityRank(value: TaxSavingSuggestion["liquidity"]) {
  if (value === "high") {
    return 3;
  }

  if (value === "medium") {
    return 2;
  }

  return 1;
}

function getRiskRank(value: TaxSavingSuggestion["risk"]) {
  if (value === "low") {
    return 3;
  }

  if (value === "medium") {
    return 2;
  }

  return 1;
}

function rankSuggestionScore(item: TaxSavingSuggestion) {
  return (
    item.expectedTaxBenefit * 100 +
    getLiquidityRank(item.liquidity) * 10 +
    getRiskRank(item.risk)
  );
}

export function compareTaxRegimes(input: TaxWizardInput): TaxWizardResult {
  const rules = getTaxRules(input.taxYear);
  const grossSalary = input.annualGrossSalary + input.bonus;
  const hraExemption = calculateHraExemption(input);
  const capped80c = clamp(input.section80c, 0, rules.section80cCap);
  const capped80d = clamp(input.section80d, 0, rules.section80dCap);
  const cappedNpsEmployee = clamp(input.npsEmployee, 0, rules.npsEmployeeCap);
  const cappedHomeLoanInterest = clamp(input.homeLoanInterest, 0, rules.homeLoanInterestCap);
  const cappedOtherDeductions = clamp(input.otherDeductions, 0, rules.otherDeductionCap);
  const employerNpsAllowed = clamp(input.npsEmployer, 0, input.basicSalary * rules.employerNpsRatioCap);

  const oldDeductions =
    rules.standardDeductionOld +
    hraExemption +
    input.professionalTax +
    capped80c +
    capped80d +
    cappedNpsEmployee +
    cappedHomeLoanInterest +
    cappedOtherDeductions;
  const newDeductions = rules.standardDeductionNew + employerNpsAllowed;
  const oldTaxableIncome = Math.max(grossSalary - oldDeductions, 0);
  const newTaxableIncome = Math.max(grossSalary - newDeductions, 0);

  let oldRegimeTax = computeTaxFromSlabs(oldTaxableIncome, rules.oldSlabs);
  oldRegimeTax -= applyRebateWithMarginalRelief(
    oldTaxableIncome,
    oldRegimeTax,
    rules.oldRebateThreshold,
    rules.oldRebateMax
  );
  oldRegimeTax = Math.max(oldRegimeTax, 0) * 1.04;

  let newRegimeTax = computeTaxFromSlabs(newTaxableIncome, rules.newSlabs);
  newRegimeTax -= applyRebateWithMarginalRelief(
    newTaxableIncome,
    newRegimeTax,
    rules.newRebateThreshold,
    rules.newRebateMax
  );
  newRegimeTax = Math.max(newRegimeTax, 0) * 1.04;

  const bestRegime = oldRegimeTax <= newRegimeTax ? "old" : "new";
  const savingsDifference = round(Math.abs(oldRegimeTax - newRegimeTax));
  const marginalRate = getMarginalRate(oldTaxableIncome, rules.oldSlabs);
  const remaining80c = Math.max(rules.section80cCap - capped80c, 0);
  const remaining80d = Math.max(rules.section80dCap - capped80d, 0);
  const remainingNps = Math.max(rules.npsEmployeeCap - cappedNpsEmployee, 0);

  const deductionImpacts = [
    {
      name: "HRA exemption",
      amountClaimed: round(hraExemption),
      cap: round(input.hraReceived),
      taxImpactEstimate: round(hraExemption * marginalRate)
    },
    {
      name: "Section 80C",
      amountClaimed: round(capped80c),
      cap: rules.section80cCap,
      taxImpactEstimate: round(capped80c * marginalRate)
    },
    {
      name: "Section 80D",
      amountClaimed: round(capped80d),
      cap: rules.section80dCap,
      taxImpactEstimate: round(capped80d * marginalRate)
    },
    {
      name: "NPS employee deduction",
      amountClaimed: round(cappedNpsEmployee),
      cap: rules.npsEmployeeCap,
      taxImpactEstimate: round(cappedNpsEmployee * marginalRate)
    },
    {
      name: "Home-loan interest",
      amountClaimed: round(cappedHomeLoanInterest),
      cap: rules.homeLoanInterestCap,
      taxImpactEstimate: round(cappedHomeLoanInterest * marginalRate)
    }
  ].sort((left, right) => right.taxImpactEstimate - left.taxImpactEstimate);

  const rankedSuggestions: TaxSavingSuggestion[] = [
    {
      name: "Top up Section 80C with ELSS, PPF, or EPF",
      risk: "medium" as const,
      liquidity: "low" as const,
      lockIn: "3 to 15 years",
      expectedTaxBenefit: round(remaining80c * marginalRate),
      notes: "Most useful when the old regime is still competitive and 80C room remains."
    },
    {
      name: "Use NPS Section 80CCD(1B)",
      risk: "medium" as const,
      liquidity: "low" as const,
      lockIn: "Till retirement",
      expectedTaxBenefit: round(remainingNps * marginalRate),
      notes: "Adds up to Rs.50,000 above the normal 80C bucket in the old regime."
    },
    {
      name: "Upgrade health cover and use Section 80D",
      risk: "low" as const,
      liquidity: "medium" as const,
      lockIn: "1 year renewable",
      expectedTaxBenefit: round(remaining80d * marginalRate),
      notes: "Useful when both protection and tax efficiency need attention."
    },
    {
      name: "Ask employer to structure NPS contribution",
      risk: "low" as const,
      liquidity: "low" as const,
      lockIn: "Till retirement",
      expectedTaxBenefit: round(employerNpsAllowed * 0.3),
      notes: "Employer NPS can remain useful even in the new regime."
    }
  ].sort((left, right) => rankSuggestionScore(right) - rankSuggestionScore(left));

  const missedDeductions = [
    remaining80c > 0 ? `Section 80C room left: Rs.${remaining80c.toLocaleString("en-IN")}` : "",
    remaining80d > 0 ? `Section 80D room left: Rs.${remaining80d.toLocaleString("en-IN")}` : "",
    remainingNps > 0 ? `NPS add-on room left: Rs.${remainingNps.toLocaleString("en-IN")}` : "",
    input.annualRentPaid <= 0 && input.hraReceived > 0
      ? "HRA is present, but annual rent is zero, so HRA exemption is not being used."
      : ""
  ].filter(Boolean);

  const winnerReasons =
    bestRegime === "old"
      ? [
          "The old regime wins because deductions and exemptions are meaningful enough to offset higher slab rates.",
          hraExemption > 0
            ? `HRA exemption alone reduces old-regime taxable income by about Rs.${round(hraExemption).toLocaleString("en-IN")}.`
            : "HRA exemption is limited, so deductions are doing more of the work than salary structuring."
        ]
      : [
          "The new regime wins because current deduction usage does not outweigh the lower slab structure.",
          `The new-regime rebate threshold for ${rules.taxYear} also helps if taxable income stays near the rebate zone.`
        ];

  const nextBestAction =
    bestRegime === "old"
      ? rankedSuggestions[0]?.name ?? "Maximize the highest-impact remaining deduction."
      : employerNpsAllowed > 0
        ? "Review employer NPS structuring because it can still help even under the new regime."
        : "Validate whether your current rent, HRA, and deduction inputs are complete before locking the regime."

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
        ? "The old regime currently wins because your available exemptions and deductions are materially reducing taxable income."
        : "The new regime currently wins because your taxable income stays more efficient under the newer slab and rebate structure.",
    taxYear: rules.taxYear,
    winnerReasons,
    deductionImpacts,
    nextBestAction,
    assumptionsUsed: rules.assumptions,
    confidence: {
      label: input.dataQuality ?? "exact",
      score: input.dataQuality === "demo" ? 35 : input.dataQuality === "estimated" ? 68 : 88,
      explanation:
        input.dataQuality === "demo"
          ? "These results are based on demo-safe placeholder inputs."
          : input.dataQuality === "estimated"
            ? "These results depend on extracted or proxy inputs that should be confirmed."
            : "These results are based on the provided salary and deduction inputs for the selected tax year.",
      lastUpdated: new Date().toISOString()
    },
    source: {
      ...(rules.sources[0] ?? {
        id: "tax-rules",
        label: "Tax rules",
        provider: "Internal",
        kind: "internal" as const
      }),
      note: input.sourceLabel ?? rules.sources[0]?.note
    }
  };
}
