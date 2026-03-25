export const maritalStatuses = ["single", "married", "engaged", "divorced"] as const;
export const riskAppetites = ["conservative", "balanced", "growth", "aggressive"] as const;
export const taxRegimes = ["old", "new", "unsure"] as const;
export const goalPriorities = ["high", "medium", "low"] as const;
export const goalTypes = [
  "retirement",
  "home",
  "education",
  "travel",
  "wealth",
  "wedding",
  "other"
] as const;
export const lifeEventTypes = [
  "annual_bonus",
  "marriage",
  "new_baby",
  "inheritance",
  "job_loss",
  "home_purchase"
] as const;
export const moneyHealthDimensions = [
  "emergency_preparedness",
  "insurance_coverage",
  "investment_diversification",
  "debt_health",
  "tax_efficiency",
  "retirement_readiness"
] as const;
export const assetClasses = [
  "equity",
  "debt",
  "gold",
  "cash",
  "epf",
  "ppf",
  "nps",
  "international",
  "alternatives"
] as const;

export type MaritalStatus = (typeof maritalStatuses)[number];
export type RiskAppetite = (typeof riskAppetites)[number];
export type TaxRegime = (typeof taxRegimes)[number];
export type GoalPriority = (typeof goalPriorities)[number];
export type GoalType = (typeof goalTypes)[number];
export type LifeEventType = (typeof lifeEventTypes)[number];
export type MoneyHealthDimensionKey = (typeof moneyHealthDimensions)[number];
export type AssetClass = (typeof assetClasses)[number];

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  targetYear: number;
  priority: GoalPriority;
  type: GoalType;
}

export interface InsuranceCoverage {
  lifeCover: number;
  healthCover: number;
  disabilityCover: number;
  personalAccidentCover: number;
}

export interface InvestmentBreakdown {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
  epf: number;
  ppf: number;
  nps: number;
  international: number;
  alternatives: number;
}

export interface SalaryBreakdown {
  annualGrossSalary: number;
  basicSalary: number;
  hraReceived: number;
  specialAllowance: number;
  bonus: number;
  employerPf: number;
  professionalTax: number;
  standardDeduction: number;
  section80c: number;
  section80d: number;
  npsEmployee: number;
  npsEmployer: number;
  homeLoanInterest: number;
  otherDeductions: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  city: string;
  age: number;
  maritalStatus: MaritalStatus;
  dependents: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  loanEmi: number;
  currentSavings: number;
  emergencyFund: number;
  insuranceCoverage: InsuranceCoverage;
  currentInvestments: InvestmentBreakdown;
  riskAppetite: RiskAppetite;
  retirementTargetAge: number;
  taxRegimePreference: TaxRegime;
  financialGoals: Goal[];
  salaryBreakdown: SalaryBreakdown;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  email: string;
  name: string;
}

export interface MoneyHealthDimensionScore {
  key: MoneyHealthDimensionKey;
  label: string;
  score: number;
  maxScore: number;
  explanation: string;
  status: "excellent" | "good" | "watch" | "critical";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  impact: "high" | "medium" | "low";
  category: "cashflow" | "protection" | "investing" | "tax" | "retirement" | "debt";
}

export interface MoneyHealthScoreResult {
  overallScore: number;
  dimensions: MoneyHealthDimensionScore[];
  recommendations: Recommendation[];
  narrative: string;
}

export interface FirePlanInput {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  investments: number;
  retirementTargetAge: number;
  expectedInflation: number;
  expectedReturnRate: number;
  lifeGoals: Goal[];
  riskAppetite: RiskAppetite;
}

export interface FireRoadmapItem {
  age: number;
  year: number;
  openingCorpus: number;
  annualContribution: number;
  projectedCorpus: number;
  inflationAdjustedExpense: number;
}

export interface AllocationGuidance {
  lifeStage: string;
  equity: number;
  debt: number;
  gold: number;
  cash: number;
  description: string;
}

export interface FirePlanResult {
  targetRetirementCorpus: number;
  projectedCorpus: number;
  monthlySipRequired: number;
  annualSavingsRate: number;
  onTrack: boolean;
  emergencyFundTarget: number;
  fallbackSuggestions: string[];
  insuranceGapSuggestions: string[];
  yearByYearRoadmap: FireRoadmapItem[];
  assetAllocationGuidance: AllocationGuidance[];
  plainEnglishSummary: string;
}

export interface LifeEventQuestion {
  id: string;
  label: string;
  type: "number" | "text" | "select";
  placeholder?: string;
  options?: string[];
}

export interface LifeEventInput {
  eventType: LifeEventType;
  answers: Record<string, string | number>;
}

export interface LifeEventActionPlan {
  emergencyFundChange: string;
  allocationUpdate: string;
  insuranceAndTaxNote: string;
  now: string[];
  in3Months: string[];
  in12Months: string[];
}

export interface TaxSavingSuggestion {
  name: string;
  risk: "low" | "medium" | "high";
  liquidity: "high" | "medium" | "low";
  lockIn: string;
  expectedTaxBenefit: number;
  notes: string;
}

export interface TaxWizardInput {
  annualGrossSalary: number;
  basicSalary: number;
  hraReceived: number;
  annualRentPaid: number;
  cityType: "metro" | "non_metro";
  bonus: number;
  employerPf: number;
  professionalTax: number;
  section80c: number;
  section80d: number;
  npsEmployee: number;
  npsEmployer: number;
  homeLoanInterest: number;
  otherDeductions: number;
}

export interface TaxWizardResult {
  oldRegimeTax: number;
  newRegimeTax: number;
  bestRegime: Exclude<TaxRegime, "unsure">;
  savingsDifference: number;
  oldTaxableIncome: number;
  newTaxableIncome: number;
  missedDeductions: string[];
  rankedSuggestions: TaxSavingSuggestion[];
  explanation: string;
}

export interface CouplePlannerInput {
  partnerA: UserProfile;
  partnerB: UserProfile;
  sharedMonthlyExpenses: number;
  jointGoals: Goal[];
}

export interface CouplePlannerResult {
  combinedIncome: number;
  combinedExpenses: number;
  combinedNetWorth: number;
  jointEmergencyFundTarget: number;
  optimizedSipSplit: {
    partnerA: number;
    partnerB: number;
  };
  highLevelSuggestions: string[];
  insuranceSplitRecommendations: string[];
  soloVsJointDelta: {
    soloEmergencyFunds: number;
    jointEmergencyFund: number;
    monthlySurplusIncrease: number;
  };
}

export interface PortfolioFund {
  fundName: string;
  category: string;
  investedAmount: number;
  currentValue: number;
  expenseRatio: number;
  benchmarkReturn: number;
  annualizedReturn: number;
  styleTags: string[];
  topHoldings: {
    name: string;
    weight: number;
  }[];
}

export interface PortfolioXRayResult {
  reconstructedHoldings: PortfolioFund[];
  assetAllocation: {
    category: string;
    value: number;
  }[];
  fundOverlap: {
    pair: string;
    overlapPercent: number;
  }[];
  expenseRatioDragEstimate: number;
  benchmarkComparison: {
    portfolioReturn: number;
    benchmarkReturn: number;
    alpha: number;
  };
  xirrApproximation: number;
  rebalancingSuggestions: string[];
  concentrationWarnings: string[];
}

export interface InsightPromptContext {
  profile: UserProfile;
  moneyHealth: MoneyHealthScoreResult;
  firePlan: FirePlanResult;
  taxResult: TaxWizardResult;
  portfolioXRay: PortfolioXRayResult;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
