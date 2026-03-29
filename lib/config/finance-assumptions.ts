import type {
  AssumptionModule,
  FinancialAssumption,
  MaritalStatus,
  RiskAppetite
} from "@/lib/types";

const EFFECTIVE_2025 = "2025-04-01";
const INTERNAL_SOURCE = "Planner defaults reviewed for Indian personal-finance use cases.";

const sharedAssumptions: FinancialAssumption[] = [
  {
    id: "inflation-default",
    label: "Planning inflation",
    value: 6,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "shared",
    description: "Used for long-term expense inflation and goal future-value calculations.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "retirement-multiple",
    label: "Retirement corpus multiple",
    value: 25,
    unit: "multiple",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "fire",
    description: "Used as a safe-withdrawal style corpus approximation for retirement planning.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "emergency-months-single",
    label: "Emergency fund target for singles",
    value: 6,
    unit: "months",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "money-health",
    description: "Baseline cash buffer for users without dependents.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "high"
  },
  {
    id: "emergency-months-family",
    label: "Emergency fund target for families",
    value: 9,
    unit: "months",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "money-health",
    description: "Baseline cash buffer for users with dependents or shared obligations.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "high"
  },
  {
    id: "life-cover-income-multiple",
    label: "Life cover income replacement multiple",
    value: 12,
    unit: "multiple",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Applied to annual income before adding liabilities and dependent reserve needs.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "dependent-reserve",
    label: "Dependent reserve add-on",
    value: 500000,
    unit: "rupees",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Reserve added per dependent when estimating life cover needs.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "disability-income-multiple",
    label: "Disability cover multiple",
    value: 5,
    unit: "multiple",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Applied to annual income when estimating disability cover.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "accident-income-multiple",
    label: "Personal accident cover multiple",
    value: 6,
    unit: "multiple",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Applied to annual income when estimating personal accident cover.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "health-cover-single",
    label: "Base health cover for single adult",
    value: 500000,
    unit: "rupees",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Baseline individual health cover before city-tier and family adjustments.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "health-cover-family",
    label: "Base family health cover",
    value: 1000000,
    unit: "rupees",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Baseline family floater health cover before city-tier adjustments.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "metro-health-cover-add-on",
    label: "Metro health-cover add-on",
    value: 250000,
    unit: "rupees",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "insurance",
    description: "Extra health cover buffer for metro medical inflation.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "low"
  },
  {
    id: "debt-stress-watch",
    label: "EMI ratio watch threshold",
    value: 30,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "money-health",
    description: "EMI-to-income ratio above this level requires attention.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "high"
  },
  {
    id: "debt-stress-critical",
    label: "EMI ratio critical threshold",
    value: 45,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "money-health",
    description: "EMI-to-income ratio above this level indicates serious cash-flow stress.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "high"
  },
  {
    id: "goal-bucket-short-term-return",
    label: "Short-term goal return assumption",
    value: 7,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "goals",
    description: "Used for goals within three years where capital preservation matters most.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "goal-bucket-medium-term-return",
    label: "Medium-term goal return assumption",
    value: 9,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "goals",
    description: "Used for goals roughly three to seven years away.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  },
  {
    id: "goal-bucket-long-term-return",
    label: "Long-term goal return assumption",
    value: 11,
    unit: "percent",
    source: INTERNAL_SOURCE,
    userVisible: true,
    module: "goals",
    description: "Used for long-term goals where equity-heavy allocation is reasonable.",
    effectiveFrom: EFFECTIVE_2025,
    confidence: "medium"
  }
];

const moduleAssumptions: Record<AssumptionModule, FinancialAssumption[]> = {
  shared: sharedAssumptions.filter((item) => item.module === "shared"),
  fire: sharedAssumptions.filter((item) => item.module === "fire"),
  goals: sharedAssumptions.filter((item) => item.module === "goals"),
  insurance: sharedAssumptions.filter((item) => item.module === "insurance"),
  "money-health": sharedAssumptions.filter((item) => item.module === "money-health"),
  tax: [],
  portfolio: [],
  couple: [],
  "life-events": [],
  uploads: [],
  ai: []
};

function getAssumptionValue(id: string) {
  return sharedAssumptions.find((item) => item.id === id)?.value;
}

export function getAssumptionsForModule(module: AssumptionModule) {
  return [...(moduleAssumptions[module] ?? []), ...moduleAssumptions.shared].filter(
    (item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index
  );
}

export function getVisibleAssumptionsForModule(module: AssumptionModule) {
  return getAssumptionsForModule(module).filter((assumption) => assumption.userVisible);
}

export function getInflationDefault() {
  return Number(getAssumptionValue("inflation-default") ?? 6);
}

export function getRetirementCorpusMultiple() {
  return Number(getAssumptionValue("retirement-multiple") ?? 25);
}

export function getRiskAdjustedReturn(riskAppetite: RiskAppetite) {
  switch (riskAppetite) {
    case "aggressive":
      return 12;
    case "growth":
      return 11;
    case "balanced":
      return 9.5;
    case "conservative":
    default:
      return 8;
  }
}

export function getEmergencyFundTargetMonths({
  dependents,
  maritalStatus,
  riskAppetite
}: {
  dependents: number;
  maritalStatus?: MaritalStatus;
  riskAppetite?: RiskAppetite;
}) {
  const familyTarget = Number(getAssumptionValue("emergency-months-family") ?? 9);
  const singleTarget = Number(getAssumptionValue("emergency-months-single") ?? 6);
  const baseTarget = dependents > 0 || maritalStatus === "married" ? familyTarget : singleTarget;

  if (riskAppetite === "conservative") {
    return baseTarget + 1;
  }

  return baseTarget;
}

export function getGoalBucketForHorizon(horizonMonths: number, riskAppetite: RiskAppetite) {
  if (horizonMonths <= 36) {
    return {
      label: "Capital preservation bucket",
      expectedReturn: Number(getAssumptionValue("goal-bucket-short-term-return") ?? 7),
      assetMix: "Debt / liquid / ultra-short duration",
      confidence: "high" as const
    };
  }

  if (horizonMonths <= 84) {
    return {
      label: "Balanced growth bucket",
      expectedReturn: Number(getAssumptionValue("goal-bucket-medium-term-return") ?? 9),
      assetMix: riskAppetite === "conservative" ? "Debt-heavy hybrid" : "Hybrid / balanced",
      confidence: "medium" as const
    };
  }

  return {
    label: "Long-term growth bucket",
    expectedReturn: Math.max(
      Number(getAssumptionValue("goal-bucket-long-term-return") ?? 11),
      getRiskAdjustedReturn(riskAppetite)
    ),
    assetMix: riskAppetite === "conservative" ? "Balanced equity" : "Equity-heavy diversified",
    confidence: "medium" as const
  };
}

export function getDebtStressThresholds() {
  return {
    watch: Number(getAssumptionValue("debt-stress-watch") ?? 30),
    critical: Number(getAssumptionValue("debt-stress-critical") ?? 45)
  };
}

export const moneyHealthWeights = {
  emergency_preparedness: 0.18,
  insurance_coverage: 0.18,
  investment_diversification: 0.14,
  debt_health: 0.16,
  tax_efficiency: 0.14,
  retirement_readiness: 0.2
} as const;

export const moneyHealthStatusCutoffs = {
  excellent: 80,
  good: 60,
  watch: 40
} as const;
