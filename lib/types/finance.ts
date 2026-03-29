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
  "bonus",
  "marriage",
  "new_baby",
  "baby",
  "inheritance",
  "job_loss",
  "job_change",
  "home_purchase",
  "emergency_medical_event"
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
export const cityTypes = ["metro", "tier_1", "tier_2", "tier_3", "non_metro"] as const;
export const assumptionConfidenceLevels = ["high", "medium", "low"] as const;
export const dataQualityStates = ["exact", "estimated", "unavailable", "demo"] as const;
export const assumptionModules = [
  "shared",
  "fire",
  "goals",
  "insurance",
  "money-health",
  "tax",
  "portfolio",
  "couple",
  "life-events",
  "uploads",
  "ai"
] as const;
export const employerBenefitKeys = [
  "employerHealthCover",
  "employerLifeCover",
  "employerDisabilityCover",
  "employerAccidentCover",
  "npsEmployerAvailable"
] as const;

export type MaritalStatus = (typeof maritalStatuses)[number];
export type RiskAppetite = (typeof riskAppetites)[number];
export type TaxRegime = (typeof taxRegimes)[number];
export type GoalPriority = (typeof goalPriorities)[number];
export type GoalType = (typeof goalTypes)[number];
export type LifeEventType = (typeof lifeEventTypes)[number];
export type MoneyHealthDimensionKey = (typeof moneyHealthDimensions)[number];
export type AssetClass = (typeof assetClasses)[number];
export type CityType = (typeof cityTypes)[number];
export type AssumptionConfidence = (typeof assumptionConfidenceLevels)[number];
export type DataQualityState = (typeof dataQualityStates)[number];
export type AssumptionModule = (typeof assumptionModules)[number];
export type EmployerBenefitKey = (typeof employerBenefitKeys)[number];

export type AssumptionUnit =
  | "percent"
  | "years"
  | "months"
  | "multiple"
  | "rupees"
  | "ratio"
  | "count"
  | "text"
  | "boolean";

export interface FinancialAssumption<T = number | string | boolean> {
  id: string;
  label: string;
  value: T;
  unit: AssumptionUnit;
  source: string;
  userVisible: boolean;
  module: AssumptionModule;
  description: string;
  effectiveFrom: string;
  effectiveTo?: string;
  confidence: AssumptionConfidence;
}

export interface SourceMeta {
  id: string;
  label: string;
  provider: string;
  kind: "official" | "user" | "derived" | "demo" | "internal";
  url?: string;
  asOf?: string;
  freshnessLabel?: string;
  note?: string;
}

export interface ConfidenceBadge {
  label: DataQualityState;
  score: number;
  explanation: string;
  lastUpdated?: string;
}

export interface EmployerBenefits {
  employerHealthCover: number;
  employerLifeCover: number;
  employerDisabilityCover: number;
  employerAccidentCover: number;
  npsEmployerAvailable: boolean;
}

export interface DebtDetail {
  id: string;
  label: string;
  type: "home_loan" | "personal_loan" | "car_loan" | "education_loan" | "credit_card" | "other";
  outstandingAmount: number;
  emi: number;
  interestRate?: number;
  monthsRemaining?: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  targetYear: number;
  priority: GoalPriority;
  type: GoalType;
  targetDate?: string;
  currentAmount?: number;
  allocatedAmount?: number;
  owner?: "self" | "partnerA" | "partnerB" | "joint";
  notes?: string;
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

export interface UploadedDataStatus {
  tax?: ConfidenceBadge;
  portfolio?: ConfidenceBadge;
  profile?: ConfidenceBadge;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  city: string;
  cityType?: CityType;
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
  employerBenefits?: EmployerBenefits;
  debtDetails?: DebtDetail[];
  uploadedDataStatus?: UploadedDataStatus;
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
  reason?: string;
  inputsUsed?: Record<string, number | string>;
  assumptionsUsed?: FinancialAssumption[];
  topAction?: string;
  severity?: "low" | "medium" | "high" | "critical";
  missingData?: string[];
  scoreDrivers?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  impact: "high" | "medium" | "low";
  category: "cashflow" | "protection" | "investing" | "tax" | "retirement" | "debt";
}

export interface InsuranceGapAnalysis {
  lifeCoverTarget: number;
  lifeCoverGap: number;
  healthCoverTarget: number;
  healthCoverGap: number;
  disabilityCoverTarget: number;
  disabilityCoverGap: number;
  personalAccidentCoverTarget: number;
  personalAccidentCoverGap: number;
  recommendedActions: string[];
  assumptionsUsed: FinancialAssumption[];
  missingInputs: string[];
}

export interface MoneyHealthScoreResult {
  overallScore: number;
  dimensions: MoneyHealthDimensionScore[];
  recommendations: Recommendation[];
  narrative: string;
  scoreDrivers?: string[];
  missingDataThatCouldChangeThis?: string[];
  assumptionsUsed?: FinancialAssumption[];
  howToImproveBy30Points?: string[];
  insuranceAnalysis?: InsuranceGapAnalysis;
  confidence?: ConfidenceBadge;
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
  currentEmergencyFund?: number;
  cityType?: CityType;
  dependents?: number;
  maritalStatus?: MaritalStatus;
  insuranceCoverage?: InsuranceCoverage;
  employerBenefits?: EmployerBenefits;
  debtDetails?: DebtDetail[];
  salaryBreakdown?: SalaryBreakdown;
}

export interface FireRoadmapItem {
  age: number;
  year: number;
  openingCorpus: number;
  annualContribution: number;
  projectedCorpus: number;
  inflationAdjustedExpense: number;
}

export interface GoalFundingStatus {
  goalId: string;
  title: string;
  type: GoalType;
  priority: GoalPriority;
  targetAmountToday: number;
  inflationAdjustedFutureValue: number;
  currentProgress: number;
  currentProgressPercent: number;
  lumpSumAllocated: number;
  requiredMonthlySip: number;
  recommendedMonthlySip: number;
  shortfall: number;
  horizonMonths: number;
  targetDate: string;
  recommendedAssetBucket: string;
  status: "funded" | "partially_funded" | "underfunded" | "deferred";
  explanation: string;
}

export interface GoalAllocationDecision {
  bucket: "emergency_fund" | "insurance" | "goal" | "retirement";
  label: string;
  referenceId?: string;
  requiredAmount: number;
  allocatedAmount: number;
  shortfall: number;
  rationale: string;
  priority: number;
}

export interface GoalFundingPlan {
  monthlyAvailable: number;
  emergencyFundMonthlyAllocation: number;
  insuranceMonthlyAllocation: number;
  retirementMonthlyAllocation: number;
  goalStatuses: GoalFundingStatus[];
  waterfall: GoalAllocationDecision[];
  underfundedItems: string[];
  assumptionsUsed: FinancialAssumption[];
}

export interface MonthlyRoadmapContribution {
  goalId: string;
  title: string;
  amount: number;
}

export interface MonthlyRoadmapItem {
  isoMonth: string;
  monthLabel: string;
  retirementSipContribution: number;
  goalSipContributions: MonthlyRoadmapContribution[];
  emergencyFundContribution: number;
  insuranceAction?: string;
  taxOptimizationNote?: string;
  expectedCumulativeCorpus: number;
  whyThisMonthLooksLikeThis: string;
}

export interface YearlyRoadmapRollup {
  year: number;
  retirementContribution: number;
  goalContribution: number;
  emergencyContribution: number;
  projectedCorpus: number;
  keyActions: string[];
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
  monthlyRoadmap?: MonthlyRoadmapItem[];
  yearlyRollups?: YearlyRoadmapRollup[];
  goalFundingPlan?: GoalFundingPlan;
  assetAllocationGuidance: AllocationGuidance[];
  assumptionsUsed?: FinancialAssumption[];
  confidence?: ConfidenceBadge;
  whatToDoNow?: string[];
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
  assumptionsUsed?: FinancialAssumption[];
  refreshedRoadmapPreview?: MonthlyRoadmapItem[];
  confidence?: ConfidenceBadge;
}

export interface TaxSavingSuggestion {
  name: string;
  risk: "low" | "medium" | "high";
  liquidity: "high" | "medium" | "low";
  lockIn: string;
  expectedTaxBenefit: number;
  notes: string;
}

export type TaxYearKey = "AY2025-26" | "AY2026-27";

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
  taxYear?: TaxYearKey;
  dataQuality?: DataQualityState;
  sourceLabel?: string;
}

export interface TaxDeductionImpact {
  name: string;
  amountClaimed: number;
  cap: number;
  taxImpactEstimate: number;
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
  taxYear?: TaxYearKey;
  winnerReasons?: string[];
  deductionImpacts?: TaxDeductionImpact[];
  nextBestAction?: string;
  assumptionsUsed?: FinancialAssumption[];
  confidence?: ConfidenceBadge;
  source?: SourceMeta;
}

export interface CouplePlannerInput {
  partnerA: UserProfile;
  partnerB: UserProfile;
  sharedMonthlyExpenses: number;
  jointGoals: Goal[];
}

export interface CoupleScenarioComparison {
  name: string;
  combinedTax: number;
  monthlyInvestable: number;
  rationale: string;
}

export interface GoalOwnershipRecommendation {
  goalId: string;
  goalTitle: string;
  owner: "partnerA" | "partnerB" | "joint";
  reason: string;
}

export interface CouplePlannerResult {
  combinedIncome: number;
  combinedExpenses: number;
  combinedNetWorth: number;
  combinedSurplus?: number;
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
  scenarioComparisons?: CoupleScenarioComparison[];
  goalOwnershipMap?: GoalOwnershipRecommendation[];
  assumptionsUsed?: FinancialAssumption[];
  confidence?: ConfidenceBadge;
}

export interface PortfolioTransaction {
  date: string;
  amount: number;
  type: "buy" | "sell" | "switch_in" | "switch_out" | "dividend" | "sip" | "redemption";
  units?: number;
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
  schemeCode?: string;
  nav?: number;
  navDate?: string;
  benchmarkName?: string;
  transactions?: PortfolioTransaction[];
  confidence?: ConfidenceBadge;
  source?: SourceMeta;
}

export interface PortfolioOverlapItem {
  pair: string;
  overlapPercent: number | null;
  status?: DataQualityState;
  basis?: string;
}

export interface PortfolioBenchmarkComparison {
  portfolioReturn: number | null;
  benchmarkReturn: number | null;
  alpha: number | null;
  benchmarkName?: string;
  status?: DataQualityState;
  source?: SourceMeta;
}

export interface PortfolioXirrAnalysis {
  value: number | null;
  status: DataQualityState;
  message: string;
}

export interface PortfolioXRayResult {
  reconstructedHoldings: PortfolioFund[];
  assetAllocation: {
    category: string;
    value: number;
  }[];
  fundOverlap: PortfolioOverlapItem[];
  expenseRatioDragEstimate: number;
  benchmarkComparison: PortfolioBenchmarkComparison;
  xirrApproximation: number | null;
  xirrAnalysis?: PortfolioXirrAnalysis;
  rebalancingSuggestions: string[];
  concentrationWarnings: string[];
  assumptionsUsed?: FinancialAssumption[];
  confidence?: ConfidenceBadge;
  sources?: SourceMeta[];
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

export interface GroundedFactsPacket {
  module: AssumptionModule;
  title: string;
  facts: Array<{
    label: string;
    value: string | number | boolean;
  }>;
  assumptions: FinancialAssumption[];
  riskNotes: string[];
  confidence?: ConfidenceBadge;
}
