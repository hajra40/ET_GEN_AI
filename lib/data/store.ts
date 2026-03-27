import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import type {
  ChatMessage,
  Goal,
  GoalPriority,
  GoalType,
  InsuranceCoverage,
  InvestmentBreakdown,
  MaritalStatus,
  PortfolioFund,
  RiskAppetite,
  SalaryBreakdown,
  SessionUser,
  TaxRegime,
  UserProfile
} from "@/lib/types";
import { demoChatHistory } from "@/lib/data/demo-meta";
import { demoPortfolios } from "@/lib/data/demo-portfolios";
import { demoProfiles } from "@/lib/data/demo-profiles";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface DemoStore {
  profiles: Map<string, UserProfile>;
  portfolios: Map<string, PortfolioFund[]>;
  chats: Map<string, ChatMessage[]>;
}

interface AppUserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  city: string;
  age: number;
  marital_status: string;
  dependents: number;
  monthly_income: number | string;
  monthly_expenses: number | string;
  loan_emi: number | string;
  current_savings: number | string;
  emergency_fund: number | string;
  risk_appetite: string;
  retirement_target_age: number;
  tax_regime_preference: string;
  onboarding_completed: boolean;
  salary_breakdown: Partial<SalaryBreakdown> | null;
  created_at: string;
  updated_at: string;
}

interface InsuranceRow {
  profile_id: string;
  life_cover: number | string;
  health_cover: number | string;
  disability_cover: number | string;
  personal_accident_cover: number | string;
}

interface InvestmentRow {
  profile_id: string;
  equity: number | string;
  debt: number | string;
  gold: number | string;
  cash: number | string;
  epf: number | string;
  ppf: number | string;
  nps: number | string;
  international: number | string;
  alternatives: number | string;
}

interface GoalRow {
  id: string;
  profile_id: string;
  title: string;
  target_amount: number | string;
  target_year: number;
  priority: string;
  goal_type: string;
  created_at?: string;
}

interface PortfolioHoldingRow {
  fund_name: string;
  category: string;
  invested_amount: number | string;
  current_value: number | string;
  expense_ratio: number | string;
  benchmark_return: number | string;
  annualized_return: number | string;
  style_tags: string[] | null;
  top_holdings: unknown;
  created_at?: string;
}

interface ChatMessageRow {
  id: string;
  profile_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ProfileBundle {
  user: AppUserRow;
  profile: ProfileRow;
  insurance: InsuranceRow | null;
  investments: InvestmentRow | null;
  goals: GoalRow[];
}

const goalTypes = new Set<GoalType>([
  "retirement",
  "home",
  "education",
  "travel",
  "wealth",
  "wedding",
  "other"
]);
const goalPriorities = new Set<GoalPriority>(["high", "medium", "low"]);
const maritalStatuses = new Set<MaritalStatus>(["single", "married", "engaged", "divorced"]);
const riskAppetites = new Set<RiskAppetite>(["conservative", "balanced", "growth", "aggressive"]);
const taxRegimes = new Set<TaxRegime>(["old", "new", "unsure"]);
const passwordPrefix = "pbkdf2$";
const passwordIterations = 120000;

const defaultInsuranceCoverage: InsuranceCoverage = {
  lifeCover: 0,
  healthCover: 500000,
  disabilityCover: 0,
  personalAccidentCover: 0
};

const defaultInvestmentBreakdown: InvestmentBreakdown = {
  equity: 0,
  debt: 0,
  gold: 0,
  cash: 50000,
  epf: 0,
  ppf: 0,
  nps: 0,
  international: 0,
  alternatives: 0
};

const defaultSalaryBreakdown: SalaryBreakdown = {
  annualGrossSalary: 900000,
  basicSalary: 360000,
  hraReceived: 120000,
  specialAllowance: 200000,
  bonus: 0,
  employerPf: 43200,
  professionalTax: 2400,
  standardDeduction: 50000,
  section80c: 0,
  section80d: 0,
  npsEmployee: 0,
  npsEmployer: 0,
  homeLoanInterest: 0,
  otherDeductions: 0
};

declare global {
  // eslint-disable-next-line no-var
  var __AI_MONEY_MENTOR_STORE__: DemoStore | undefined;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function cloneProfile(profile: UserProfile) {
  return {
    ...profile,
    insuranceCoverage: { ...profile.insuranceCoverage },
    currentInvestments: { ...profile.currentInvestments },
    financialGoals: profile.financialGoals.map((goal) => ({ ...goal })),
    salaryBreakdown: { ...profile.salaryBreakdown }
  };
}

function clonePortfolio(funds: PortfolioFund[]) {
  return funds.map((fund) => ({
    ...fund,
    styleTags: [...fund.styleTags],
    topHoldings: fund.topHoldings.map((holding) => ({ ...holding }))
  }));
}

function cloneChat(messages: ChatMessage[]) {
  return messages.map((message) => ({ ...message }));
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, passwordIterations, 64, "sha512").toString("hex");
  return `${passwordPrefix}${passwordIterations}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedPassword: string) {
  if (!storedPassword.startsWith(passwordPrefix)) {
    return storedPassword === password;
  }

  const [, rawIterations, salt, storedHash] = storedPassword.split("$");
  const iterations = Number(rawIterations);
  if (!salt || !storedHash || !Number.isFinite(iterations)) {
    return false;
  }

  const computedHash = pbkdf2Sync(password, salt, iterations, 64, "sha512");
  const existingHash = Buffer.from(storedHash, "hex");

  if (computedHash.length !== existingHash.length) {
    return false;
  }

  return timingSafeEqual(computedHash, existingHash);
}

function buildDefaultGoal(): Goal {
  return {
    id: randomUUID(),
    title: "Emergency reserve",
    targetAmount: 300000,
    targetYear: new Date().getFullYear() + 1,
    priority: "high",
    type: "wealth"
  };
}

function buildDefaultProfile(name: string, email: string, password: string): UserProfile {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    name,
    email: normalizeEmail(email),
    password,
    city: "Bengaluru",
    age: 27,
    maritalStatus: "single",
    dependents: 0,
    monthlyIncome: 75000,
    monthlyExpenses: 40000,
    loanEmi: 0,
    currentSavings: 50000,
    emergencyFund: 50000,
    insuranceCoverage: { ...defaultInsuranceCoverage },
    currentInvestments: { ...defaultInvestmentBreakdown },
    riskAppetite: "balanced",
    retirementTargetAge: 58,
    taxRegimePreference: "unsure",
    financialGoals: [buildDefaultGoal()],
    salaryBreakdown: { ...defaultSalaryBreakdown },
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now
  };
}

function mergeProfile(existing: UserProfile, partialProfile: Partial<UserProfile>) {
  return {
    ...existing,
    ...partialProfile,
    insuranceCoverage: {
      ...existing.insuranceCoverage,
      ...partialProfile.insuranceCoverage
    },
    currentInvestments: {
      ...existing.currentInvestments,
      ...partialProfile.currentInvestments
    },
    salaryBreakdown: {
      ...existing.salaryBreakdown,
      ...partialProfile.salaryBreakdown
    },
    financialGoals: partialProfile.financialGoals ?? existing.financialGoals,
    updatedAt: new Date().toISOString()
  } satisfies UserProfile;
}

function buildDemoStore(): DemoStore {
  return {
    profiles: new Map(demoProfiles.map((profile) => [normalizeEmail(profile.email), cloneProfile(profile)])),
    portfolios: new Map(
      Object.entries(demoPortfolios).map(([email, funds]) => [normalizeEmail(email), clonePortfolio(funds)])
    ),
    chats: new Map(
      Object.entries(demoChatHistory).map(([email, messages]) => [normalizeEmail(email), cloneChat(messages)])
    )
  };
}

function getDemoStore() {
  if (!global.__AI_MONEY_MENTOR_STORE__) {
    global.__AI_MONEY_MENTOR_STORE__ = buildDemoStore();
  }

  return global.__AI_MONEY_MENTOR_STORE__;
}

function getAllProfilesFromDemo() {
  return Array.from(getDemoStore().profiles.values()).map(cloneProfile);
}

function getProfileByEmailFromDemo(email: string) {
  const profile = getDemoStore().profiles.get(normalizeEmail(email));
  return profile ? cloneProfile(profile) : null;
}

function authenticateUserFromDemo(email: string, password: string): SessionUser | null {
  const profile = getDemoStore().profiles.get(normalizeEmail(email));
  if (!profile || !verifyPassword(password, profile.password)) {
    return null;
  }

  return {
    email: profile.email,
    name: profile.name
  };
}

function createUserInDemoStore(name: string, email: string, password: string) {
  const store = getDemoStore();
  const normalizedEmail = normalizeEmail(email);

  if (store.profiles.has(normalizedEmail)) {
    throw new Error("User already exists.");
  }

  const profile = buildDefaultProfile(name, normalizedEmail, hashPassword(password));
  store.profiles.set(normalizedEmail, profile);
  store.portfolios.set(normalizedEmail, []);
  store.chats.set(normalizedEmail, []);

  return {
    email: normalizedEmail,
    name
  } satisfies SessionUser;
}

function upsertProfileInDemoStore(email: string, partialProfile: Partial<UserProfile>) {
  const store = getDemoStore();
  const normalizedEmail = normalizeEmail(email);
  const existing = store.profiles.get(normalizedEmail);
  if (!existing) {
    throw new Error("Profile not found.");
  }

  const updated = mergeProfile(existing, partialProfile);
  store.profiles.set(normalizedEmail, updated);
  return cloneProfile(updated);
}

function getPortfolioByEmailFromDemo(email: string) {
  return clonePortfolio(getDemoStore().portfolios.get(normalizeEmail(email)) ?? []);
}

function setPortfolioByEmailInDemoStore(email: string, funds: PortfolioFund[]) {
  const normalizedEmail = normalizeEmail(email);
  const clonedFunds = clonePortfolio(funds);
  getDemoStore().portfolios.set(normalizedEmail, clonedFunds);
  return clonePortfolio(clonedFunds);
}

function getChatHistoryFromDemo(email: string) {
  return cloneChat(getDemoStore().chats.get(normalizeEmail(email)) ?? []);
}

function addChatMessageInDemoStore(email: string, message: ChatMessage) {
  const normalizedEmail = normalizeEmail(email);
  const messages = getDemoStore().chats.get(normalizedEmail) ?? [];
  getDemoStore().chats.set(normalizedEmail, [...messages, { ...message }]);
}

function normalizeGoalPriority(priority: string): GoalPriority {
  return goalPriorities.has(priority as GoalPriority) ? (priority as GoalPriority) : "medium";
}

function normalizeGoalType(goalType: string): GoalType {
  return goalTypes.has(goalType as GoalType) ? (goalType as GoalType) : "other";
}

function normalizeMaritalStatus(status: string): MaritalStatus {
  return maritalStatuses.has(status as MaritalStatus) ? (status as MaritalStatus) : "single";
}

function normalizeRiskAppetite(value: string): RiskAppetite {
  return riskAppetites.has(value as RiskAppetite) ? (value as RiskAppetite) : "balanced";
}

function normalizeTaxRegime(value: string): TaxRegime {
  return taxRegimes.has(value as TaxRegime) ? (value as TaxRegime) : "unsure";
}

function normalizeSalaryBreakdown(value: Partial<SalaryBreakdown> | null | undefined): SalaryBreakdown {
  return {
    annualGrossSalary: toNumber(value?.annualGrossSalary, defaultSalaryBreakdown.annualGrossSalary),
    basicSalary: toNumber(value?.basicSalary, defaultSalaryBreakdown.basicSalary),
    hraReceived: toNumber(value?.hraReceived, defaultSalaryBreakdown.hraReceived),
    specialAllowance: toNumber(value?.specialAllowance, defaultSalaryBreakdown.specialAllowance),
    bonus: toNumber(value?.bonus, defaultSalaryBreakdown.bonus),
    employerPf: toNumber(value?.employerPf, defaultSalaryBreakdown.employerPf),
    professionalTax: toNumber(value?.professionalTax, defaultSalaryBreakdown.professionalTax),
    standardDeduction: toNumber(value?.standardDeduction, defaultSalaryBreakdown.standardDeduction),
    section80c: toNumber(value?.section80c, defaultSalaryBreakdown.section80c),
    section80d: toNumber(value?.section80d, defaultSalaryBreakdown.section80d),
    npsEmployee: toNumber(value?.npsEmployee, defaultSalaryBreakdown.npsEmployee),
    npsEmployer: toNumber(value?.npsEmployer, defaultSalaryBreakdown.npsEmployer),
    homeLoanInterest: toNumber(value?.homeLoanInterest, defaultSalaryBreakdown.homeLoanInterest),
    otherDeductions: toNumber(value?.otherDeductions, defaultSalaryBreakdown.otherDeductions)
  };
}

function mapBundleToUserProfile(bundle: ProfileBundle): UserProfile {
  return {
    id: bundle.profile.id,
    name: bundle.user.name,
    email: bundle.user.email,
    password: bundle.user.password_hash,
    city: bundle.profile.city,
    age: bundle.profile.age,
    maritalStatus: normalizeMaritalStatus(bundle.profile.marital_status),
    dependents: bundle.profile.dependents,
    monthlyIncome: toNumber(bundle.profile.monthly_income),
    monthlyExpenses: toNumber(bundle.profile.monthly_expenses),
    loanEmi: toNumber(bundle.profile.loan_emi),
    currentSavings: toNumber(bundle.profile.current_savings),
    emergencyFund: toNumber(bundle.profile.emergency_fund),
    insuranceCoverage: {
      lifeCover: toNumber(bundle.insurance?.life_cover, defaultInsuranceCoverage.lifeCover),
      healthCover: toNumber(bundle.insurance?.health_cover, defaultInsuranceCoverage.healthCover),
      disabilityCover: toNumber(bundle.insurance?.disability_cover, defaultInsuranceCoverage.disabilityCover),
      personalAccidentCover: toNumber(
        bundle.insurance?.personal_accident_cover,
        defaultInsuranceCoverage.personalAccidentCover
      )
    },
    currentInvestments: {
      equity: toNumber(bundle.investments?.equity, defaultInvestmentBreakdown.equity),
      debt: toNumber(bundle.investments?.debt, defaultInvestmentBreakdown.debt),
      gold: toNumber(bundle.investments?.gold, defaultInvestmentBreakdown.gold),
      cash: toNumber(bundle.investments?.cash, defaultInvestmentBreakdown.cash),
      epf: toNumber(bundle.investments?.epf, defaultInvestmentBreakdown.epf),
      ppf: toNumber(bundle.investments?.ppf, defaultInvestmentBreakdown.ppf),
      nps: toNumber(bundle.investments?.nps, defaultInvestmentBreakdown.nps),
      international: toNumber(bundle.investments?.international, defaultInvestmentBreakdown.international),
      alternatives: toNumber(bundle.investments?.alternatives, defaultInvestmentBreakdown.alternatives)
    },
    riskAppetite: normalizeRiskAppetite(bundle.profile.risk_appetite),
    retirementTargetAge: bundle.profile.retirement_target_age,
    taxRegimePreference: normalizeTaxRegime(bundle.profile.tax_regime_preference),
    financialGoals: bundle.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: toNumber(goal.target_amount),
      targetYear: goal.target_year,
      priority: normalizeGoalPriority(goal.priority),
      type: normalizeGoalType(goal.goal_type)
    })),
    salaryBreakdown: normalizeSalaryBreakdown(bundle.profile.salary_breakdown),
    onboardingCompleted: bundle.profile.onboarding_completed,
    createdAt: bundle.profile.created_at,
    updatedAt: bundle.profile.updated_at
  };
}

function parseTopHoldings(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const name = "name" in entry ? String(entry.name) : "";
      const weight = "weight" in entry ? toNumber(entry.weight as number | string, 0) : 0;

      if (!name) {
        return null;
      }

      return { name, weight };
    })
    .filter((entry): entry is { name: string; weight: number } => Boolean(entry));
}

async function fetchUserByEmailFromSupabase(email: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AppUserRow | null) ?? null;
}

async function loadProfileBundles(users: AppUserRow[]) {
  const supabase = getSupabaseServerClient();
  if (!supabase || !users.length) {
    return [] as ProfileBundle[];
  }

  const userIds = users.map((user) => user.id);
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", userIds);

  if (profilesError) {
    throw profilesError;
  }

  const profiles = (profilesData as ProfileRow[] | null) ?? [];
  const profileIds = profiles.map((profile) => profile.id);

  const insurancePromise = profileIds.length
    ? supabase.from("insurance_coverages").select("*").in("profile_id", profileIds)
    : Promise.resolve({ data: [], error: null });
  const investmentsPromise = profileIds.length
    ? supabase.from("investment_snapshots").select("*").in("profile_id", profileIds)
    : Promise.resolve({ data: [], error: null });
  const goalsPromise = profileIds.length
    ? supabase
        .from("financial_goals")
        .select("*")
        .in("profile_id", profileIds)
        .order("created_at", { ascending: true })
    : Promise.resolve({ data: [], error: null });

  const [
    { data: insuranceData, error: insuranceError },
    { data: investmentsData, error: investmentsError },
    { data: goalsData, error: goalsError }
  ] = await Promise.all([insurancePromise, investmentsPromise, goalsPromise]);

  if (insuranceError) {
    throw insuranceError;
  }
  if (investmentsError) {
    throw investmentsError;
  }
  if (goalsError) {
    throw goalsError;
  }

  const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const insuranceByProfileId = new Map(
    (((insuranceData as InsuranceRow[] | null) ?? []).map((insurance) => [insurance.profile_id, insurance]))
  );
  const investmentsByProfileId = new Map(
    (((investmentsData as InvestmentRow[] | null) ?? []).map((investments) => [investments.profile_id, investments]))
  );
  const goalsByProfileId = new Map<string, GoalRow[]>();

  for (const goal of ((goalsData as GoalRow[] | null) ?? [])) {
    const current = goalsByProfileId.get(goal.profile_id) ?? [];
    current.push(goal);
    goalsByProfileId.set(goal.profile_id, current);
  }

  return users
    .map((user) => {
      const profile = profileByUserId.get(user.id);
      if (!profile) {
        return null;
      }

      return {
        user,
        profile,
        insurance: insuranceByProfileId.get(profile.id) ?? null,
        investments: investmentsByProfileId.get(profile.id) ?? null,
        goals: goalsByProfileId.get(profile.id) ?? []
      } satisfies ProfileBundle;
    })
    .filter((bundle): bundle is ProfileBundle => Boolean(bundle));
}

async function fetchProfileBundleByEmailFromSupabase(email: string) {
  const user = await fetchUserByEmailFromSupabase(email);
  if (!user) {
    return null;
  }

  const [bundle] = await loadProfileBundles([user]);
  return bundle ?? null;
}

async function getProfileRecordByEmail(email: string) {
  const bundle = await fetchProfileBundleByEmailFromSupabase(email);
  if (!bundle) {
    return null;
  }

  return {
    userId: bundle.user.id,
    profileId: bundle.profile.id,
    profile: mapBundleToUserProfile(bundle)
  };
}

function mapSupabaseError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallbackMessage;
}

export async function getAllProfiles() {
  if (!isSupabaseConfigured()) {
    return getAllProfilesFromDemo();
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const bundles = await loadProfileBundles(((data as AppUserRow[] | null) ?? []));
    return bundles.map(mapBundleToUserProfile);
  } catch (error) {
    console.error("Failed to load profiles from Supabase.", error);
    return [];
  }
}

export async function getProfileByEmail(email: string) {
  if (!isSupabaseConfigured()) {
    return getProfileByEmailFromDemo(email);
  }

  try {
    const bundle = await fetchProfileBundleByEmailFromSupabase(email);
    return bundle ? mapBundleToUserProfile(bundle) : null;
  } catch (error) {
    console.error("Failed to load profile from Supabase.", error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return authenticateUserFromDemo(email, password);
  }

  const user = await fetchUserByEmailFromSupabase(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return {
    email: user.email,
    name: user.name
  };
}

export async function createUser(name: string, email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return createUserInDemoStore(name, email, password);
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedEmail = normalizeEmail(email);
  const defaultProfile = buildDefaultProfile(name, normalizedEmail, hashPassword(password));

  const { data: existingUser } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingUser) {
    throw new Error("User already exists.");
  }

  const { data: userData, error: userError } = await supabase
    .from("app_users")
    .insert({
      email: normalizedEmail,
      password_hash: defaultProfile.password,
      name
    })
    .select("*")
    .single();

  if (userError) {
    throw new Error(mapSupabaseError(userError, "Unable to create account."));
  }

  const user = userData as AppUserRow;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        city: defaultProfile.city,
        age: defaultProfile.age,
        marital_status: defaultProfile.maritalStatus,
        dependents: defaultProfile.dependents,
        monthly_income: defaultProfile.monthlyIncome,
        monthly_expenses: defaultProfile.monthlyExpenses,
        loan_emi: defaultProfile.loanEmi,
        current_savings: defaultProfile.currentSavings,
        emergency_fund: defaultProfile.emergencyFund,
        risk_appetite: defaultProfile.riskAppetite,
        retirement_target_age: defaultProfile.retirementTargetAge,
        tax_regime_preference: defaultProfile.taxRegimePreference,
        onboarding_completed: defaultProfile.onboardingCompleted,
        salary_breakdown: defaultProfile.salaryBreakdown
      })
      .select("id")
      .single();

    if (profileError) {
      throw profileError;
    }

    const profileId = (profileData as { id: string }).id;
    const goal = defaultProfile.financialGoals[0] ?? buildDefaultGoal();

    const insurancePromise = supabase.from("insurance_coverages").upsert({
      profile_id: profileId,
      life_cover: defaultProfile.insuranceCoverage.lifeCover,
      health_cover: defaultProfile.insuranceCoverage.healthCover,
      disability_cover: defaultProfile.insuranceCoverage.disabilityCover,
      personal_accident_cover: defaultProfile.insuranceCoverage.personalAccidentCover
    });
    const investmentsPromise = supabase.from("investment_snapshots").upsert({
      profile_id: profileId,
      equity: defaultProfile.currentInvestments.equity,
      debt: defaultProfile.currentInvestments.debt,
      gold: defaultProfile.currentInvestments.gold,
      cash: defaultProfile.currentInvestments.cash,
      epf: defaultProfile.currentInvestments.epf,
      ppf: defaultProfile.currentInvestments.ppf,
      nps: defaultProfile.currentInvestments.nps,
      international: defaultProfile.currentInvestments.international,
      alternatives: defaultProfile.currentInvestments.alternatives
    });
    const goalsPromise = supabase.from("financial_goals").insert({
      profile_id: profileId,
      title: goal.title,
      target_amount: goal.targetAmount,
      target_year: goal.targetYear,
      priority: goal.priority,
      goal_type: goal.type
    });

    const [
      { error: insuranceError },
      { error: investmentsError },
      { error: goalsError }
    ] = await Promise.all([insurancePromise, investmentsPromise, goalsPromise]);

    if (insuranceError || investmentsError || goalsError) {
      throw insuranceError ?? investmentsError ?? goalsError;
    }
  } catch (error) {
    await supabase.from("app_users").delete().eq("id", user.id);
    throw new Error(mapSupabaseError(error, "Unable to create account."));
  }

  return {
    email: normalizedEmail,
    name
  } satisfies SessionUser;
}

export async function upsertProfile(email: string, partialProfile: Partial<UserProfile>) {
  if (!isSupabaseConfigured()) {
    return upsertProfileInDemoStore(email, partialProfile);
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const record = await getProfileRecordByEmail(email);
  if (!record) {
    throw new Error("Profile not found.");
  }

  const updated = mergeProfile(record.profile, partialProfile);
  const now = new Date().toISOString();

  const { error: userError } = await supabase
    .from("app_users")
    .update({
      name: updated.name,
      updated_at: now
    })
    .eq("id", record.userId);

  if (userError) {
    throw new Error(mapSupabaseError(userError, "Unable to update account."));
  }

  const profileUpdatePromise = supabase
    .from("profiles")
    .update({
      city: updated.city,
      age: updated.age,
      marital_status: updated.maritalStatus,
      dependents: updated.dependents,
      monthly_income: updated.monthlyIncome,
      monthly_expenses: updated.monthlyExpenses,
      loan_emi: updated.loanEmi,
      current_savings: updated.currentSavings,
      emergency_fund: updated.emergencyFund,
      risk_appetite: updated.riskAppetite,
      retirement_target_age: updated.retirementTargetAge,
      tax_regime_preference: updated.taxRegimePreference,
      onboarding_completed: updated.onboardingCompleted,
      salary_breakdown: updated.salaryBreakdown,
      updated_at: now
    })
    .eq("id", record.profileId);
  const insuranceUpdatePromise = supabase.from("insurance_coverages").upsert({
    profile_id: record.profileId,
    life_cover: updated.insuranceCoverage.lifeCover,
    health_cover: updated.insuranceCoverage.healthCover,
    disability_cover: updated.insuranceCoverage.disabilityCover,
    personal_accident_cover: updated.insuranceCoverage.personalAccidentCover,
    updated_at: now
  });
  const investmentsUpdatePromise = supabase.from("investment_snapshots").upsert({
    profile_id: record.profileId,
    equity: updated.currentInvestments.equity,
    debt: updated.currentInvestments.debt,
    gold: updated.currentInvestments.gold,
    cash: updated.currentInvestments.cash,
    epf: updated.currentInvestments.epf,
    ppf: updated.currentInvestments.ppf,
    nps: updated.currentInvestments.nps,
    international: updated.currentInvestments.international,
    alternatives: updated.currentInvestments.alternatives,
    updated_at: now
  });

  const [
    { error: profileError },
    { error: insuranceError },
    { error: investmentsError }
  ] = await Promise.all([profileUpdatePromise, insuranceUpdatePromise, investmentsUpdatePromise]);

  if (profileError || insuranceError || investmentsError) {
    throw new Error(mapSupabaseError(profileError ?? insuranceError ?? investmentsError, "Unable to save profile."));
  }

  const { error: deleteGoalsError } = await supabase
    .from("financial_goals")
    .delete()
    .eq("profile_id", record.profileId);

  if (deleteGoalsError) {
    throw new Error(mapSupabaseError(deleteGoalsError, "Unable to save goals."));
  }

  const goalRows = updated.financialGoals.map((goal) => {
    const row: Record<string, unknown> = {
      profile_id: record.profileId,
      title: goal.title,
      target_amount: goal.targetAmount,
      target_year: goal.targetYear,
      priority: goal.priority,
      goal_type: goal.type
    };

    if (isUuid(goal.id)) {
      row.id = goal.id;
    }

    return row;
  });

  if (goalRows.length) {
    const { error: insertGoalsError } = await supabase.from("financial_goals").insert(goalRows);
    if (insertGoalsError) {
      throw new Error(mapSupabaseError(insertGoalsError, "Unable to save goals."));
    }
  }

  const refreshedProfile = await getProfileByEmail(email);
  if (!refreshedProfile) {
    throw new Error("Profile not found.");
  }

  return refreshedProfile;
}

export async function getPortfolioByEmail(email: string) {
  if (!isSupabaseConfigured()) {
    return getPortfolioByEmailFromDemo(email);
  }

  try {
    const record = await getProfileRecordByEmail(email);
    if (!record) {
      return [];
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("profile_id", record.profileId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (((data as PortfolioHoldingRow[] | null) ?? []).map((fund) => ({
      fundName: fund.fund_name,
      category: fund.category,
      investedAmount: toNumber(fund.invested_amount),
      currentValue: toNumber(fund.current_value),
      expenseRatio: toNumber(fund.expense_ratio),
      benchmarkReturn: toNumber(fund.benchmark_return),
      annualizedReturn: toNumber(fund.annualized_return),
      styleTags: fund.style_tags ?? [],
      topHoldings: parseTopHoldings(fund.top_holdings)
    })));
  } catch (error) {
    console.error("Failed to load portfolio from Supabase.", error);
    return [];
  }
}

export async function setPortfolioByEmail(email: string, funds: PortfolioFund[]) {
  if (!isSupabaseConfigured()) {
    return setPortfolioByEmailInDemoStore(email, funds);
  }

  const record = await getProfileRecordByEmail(email);
  if (!record) {
    throw new Error("Profile not found.");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error: deleteError } = await supabase
    .from("portfolio_holdings")
    .delete()
    .eq("profile_id", record.profileId);

  if (deleteError) {
    throw new Error(mapSupabaseError(deleteError, "Unable to save portfolio."));
  }

  if (funds.length) {
    const { error: insertError } = await supabase.from("portfolio_holdings").insert(
      funds.map((fund) => ({
        profile_id: record.profileId,
        fund_name: fund.fundName,
        category: fund.category,
        invested_amount: fund.investedAmount,
        current_value: fund.currentValue,
        expense_ratio: fund.expenseRatio,
        benchmark_return: fund.benchmarkReturn,
        annualized_return: fund.annualizedReturn,
        style_tags: fund.styleTags,
        top_holdings: fund.topHoldings
      }))
    );

    if (insertError) {
      throw new Error(mapSupabaseError(insertError, "Unable to save portfolio."));
    }
  }

  return getPortfolioByEmail(email);
}

export async function getChatHistory(email: string) {
  if (!isSupabaseConfigured()) {
    return getChatHistoryFromDemo(email);
  }

  try {
    const record = await getProfileRecordByEmail(email);
    if (!record) {
      return [];
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("profile_id", record.profileId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (((data as ChatMessageRow[] | null) ?? []).map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.created_at
    })));
  } catch (error) {
    console.error("Failed to load chat history from Supabase.", error);
    return [];
  }
}

export async function addChatMessage(email: string, message: ChatMessage) {
  if (!isSupabaseConfigured()) {
    addChatMessageInDemoStore(email, message);
    return;
  }

  const record = await getProfileRecordByEmail(email);
  if (!record) {
    throw new Error("Profile not found.");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const row: Record<string, unknown> = {
    profile_id: record.profileId,
    role: message.role,
    content: message.content
  };

  if (isUuid(message.id)) {
    row.id = message.id;
  }

  const { error } = await supabase.from("chat_messages").insert(row);
  if (error) {
    throw new Error(mapSupabaseError(error, "Unable to save chat message."));
  }
}
