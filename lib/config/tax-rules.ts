import type {
  FinancialAssumption,
  SourceMeta,
  TaxYearKey
} from "@/lib/types";

export interface TaxSlab {
  upto: number;
  rate: number;
}

export interface TaxRuleSet {
  taxYear: TaxYearKey;
  standardDeductionOld: number;
  standardDeductionNew: number;
  oldSlabs: TaxSlab[];
  newSlabs: TaxSlab[];
  oldRebateThreshold: number;
  oldRebateMax: number;
  newRebateThreshold: number;
  newRebateMax: number;
  section80cCap: number;
  section80dCap: number;
  npsEmployeeCap: number;
  homeLoanInterestCap: number;
  otherDeductionCap: number;
  employerNpsRatioCap: number;
  sources: SourceMeta[];
  assumptions: FinancialAssumption[];
}

const incomeTaxPortalAy2025: SourceMeta = {
  id: "income-tax-ay2025-26",
  label: "Income Tax Department AY 2025-26 salaried guidance",
  provider: "Income Tax Department",
  kind: "official",
  url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
  asOf: "2025-04-01",
  freshnessLabel: "Portal guidance"
};

const incomeTaxFaqSource: SourceMeta = {
  id: "income-tax-regime-faq",
  label: "Income Tax Department old vs new regime FAQs",
  provider: "Income Tax Department",
  kind: "official",
  url: "https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs",
  freshnessLabel: "FAQ reference"
};

const pibBudget2025Source: SourceMeta = {
  id: "pib-budget-2025-tax",
  label: "PIB Budget 2025-26 income tax slab changes",
  provider: "Press Information Bureau",
  kind: "official",
  url: "https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2098406",
  asOf: "2025-02-01",
  freshnessLabel: "Budget 2025 announcement"
};

const baseTaxAssumptions = (
  taxYear: TaxYearKey,
  newRebateThreshold: number,
  newRebateMax: number,
  standardDeductionNew: number
): FinancialAssumption[] => [
  {
    id: `${taxYear}-standard-deduction-old`,
    label: `Old regime standard deduction (${taxYear})`,
    value: 50000,
    unit: "rupees",
    source: incomeTaxPortalAy2025.label,
    userVisible: true,
    module: "tax",
    description: "Standard deduction assumed for salaried users in the old regime.",
    effectiveFrom: taxYear === "AY2025-26" ? "2024-04-01" : "2025-04-01",
    confidence: "high"
  },
  {
    id: `${taxYear}-standard-deduction-new`,
    label: `New regime standard deduction (${taxYear})`,
    value: standardDeductionNew,
    unit: "rupees",
    source: taxYear === "AY2025-26" ? incomeTaxPortalAy2025.label : pibBudget2025Source.label,
    userVisible: true,
    module: "tax",
    description: "Standard deduction assumed for salaried users in the new regime.",
    effectiveFrom: taxYear === "AY2025-26" ? "2024-04-01" : "2025-04-01",
    confidence: "high"
  },
  {
    id: `${taxYear}-new-regime-rebate-threshold`,
    label: `New regime rebate threshold (${taxYear})`,
    value: newRebateThreshold,
    unit: "rupees",
    source: taxYear === "AY2025-26" ? incomeTaxPortalAy2025.label : pibBudget2025Source.label,
    userVisible: true,
    module: "tax",
    description: "Resident individual rebate threshold under the new regime.",
    effectiveFrom: taxYear === "AY2025-26" ? "2024-04-01" : "2025-04-01",
    confidence: "high"
  },
  {
    id: `${taxYear}-new-regime-rebate-max`,
    label: `New regime rebate cap (${taxYear})`,
    value: newRebateMax,
    unit: "rupees",
    source: taxYear === "AY2025-26" ? incomeTaxPortalAy2025.label : pibBudget2025Source.label,
    userVisible: true,
    module: "tax",
    description: "Maximum rebate available under section 87A in the new regime.",
    effectiveFrom: taxYear === "AY2025-26" ? "2024-04-01" : "2025-04-01",
    confidence: "high"
  }
];

export const taxRulesByYear: Record<TaxYearKey, TaxRuleSet> = {
  "AY2025-26": {
    taxYear: "AY2025-26",
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    oldSlabs: [
      { upto: 250000, rate: 0 },
      { upto: 500000, rate: 0.05 },
      { upto: 1000000, rate: 0.2 },
      { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
    ],
    newSlabs: [
      { upto: 300000, rate: 0 },
      { upto: 700000, rate: 0.05 },
      { upto: 1000000, rate: 0.1 },
      { upto: 1200000, rate: 0.15 },
      { upto: 1500000, rate: 0.2 },
      { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
    ],
    oldRebateThreshold: 500000,
    oldRebateMax: 12500,
    newRebateThreshold: 700000,
    newRebateMax: 25000,
    section80cCap: 150000,
    section80dCap: 25000,
    npsEmployeeCap: 50000,
    homeLoanInterestCap: 200000,
    otherDeductionCap: 50000,
    employerNpsRatioCap: 0.14,
    sources: [incomeTaxPortalAy2025, incomeTaxFaqSource],
    assumptions: baseTaxAssumptions("AY2025-26", 700000, 25000, 75000)
  },
  "AY2026-27": {
    taxYear: "AY2026-27",
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    oldSlabs: [
      { upto: 250000, rate: 0 },
      { upto: 500000, rate: 0.05 },
      { upto: 1000000, rate: 0.2 },
      { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
    ],
    newSlabs: [
      { upto: 400000, rate: 0 },
      { upto: 800000, rate: 0.05 },
      { upto: 1200000, rate: 0.1 },
      { upto: 1600000, rate: 0.15 },
      { upto: 2000000, rate: 0.2 },
      { upto: 2400000, rate: 0.25 },
      { upto: Number.POSITIVE_INFINITY, rate: 0.3 }
    ],
    oldRebateThreshold: 500000,
    oldRebateMax: 12500,
    newRebateThreshold: 1200000,
    newRebateMax: 60000,
    section80cCap: 150000,
    section80dCap: 25000,
    npsEmployeeCap: 50000,
    homeLoanInterestCap: 200000,
    otherDeductionCap: 50000,
    employerNpsRatioCap: 0.14,
    sources: [pibBudget2025Source, incomeTaxFaqSource],
    assumptions: baseTaxAssumptions("AY2026-27", 1200000, 60000, 75000)
  }
};

export function getDefaultTaxYear(today = new Date()): TaxYearKey {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (year > 2025 || (year === 2025 && month >= 4)) {
    return "AY2026-27";
  }

  return "AY2025-26";
}

export function getTaxRules(taxYear?: TaxYearKey) {
  const resolvedYear = taxYear ?? getDefaultTaxYear();
  return taxRulesByYear[resolvedYear];
}
