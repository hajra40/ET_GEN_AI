import type {
  ChatMessage,
  PortfolioFund,
  SessionUser,
  UserProfile
} from "@/lib/types";
import { demoChatHistory } from "@/lib/data/demo-meta";
import { demoPortfolios } from "@/lib/data/demo-portfolios";
import { demoProfiles } from "@/lib/data/demo-profiles";

interface AppStore {
  profiles: Map<string, UserProfile>;
  portfolios: Map<string, PortfolioFund[]>;
  chats: Map<string, ChatMessage[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __AI_MONEY_MENTOR_STORE__: AppStore | undefined;
}

function buildStore(): AppStore {
  return {
    profiles: new Map(demoProfiles.map((profile) => [profile.email, profile])),
    portfolios: new Map(Object.entries(demoPortfolios)),
    chats: new Map(Object.entries(demoChatHistory))
  };
}

export function getStore() {
  if (!global.__AI_MONEY_MENTOR_STORE__) {
    global.__AI_MONEY_MENTOR_STORE__ = buildStore();
  }

  return global.__AI_MONEY_MENTOR_STORE__;
}

export function getAllProfiles() {
  return Array.from(getStore().profiles.values());
}

export function getProfileByEmail(email: string) {
  return getStore().profiles.get(email);
}

export function authenticateUser(email: string, password: string): SessionUser | null {
  const profile = getProfileByEmail(email);
  if (!profile || profile.password !== password) {
    return null;
  }

  return {
    email: profile.email,
    name: profile.name
  };
}

export function createUser(name: string, email: string, password: string) {
  const store = getStore();
  if (store.profiles.has(email)) {
    throw new Error("User already exists");
  }

  const profile: UserProfile = {
    id: `profile-${Date.now()}`,
    name,
    email,
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
    insuranceCoverage: {
      lifeCover: 0,
      healthCover: 500000,
      disabilityCover: 0,
      personalAccidentCover: 0
    },
    currentInvestments: {
      equity: 0,
      debt: 0,
      gold: 0,
      cash: 50000,
      epf: 0,
      ppf: 0,
      nps: 0,
      international: 0,
      alternatives: 0
    },
    riskAppetite: "balanced",
    retirementTargetAge: 58,
    taxRegimePreference: "unsure",
    financialGoals: [
      {
        id: "goal-default",
        title: "Emergency reserve",
        targetAmount: 300000,
        targetYear: new Date().getFullYear() + 1,
        priority: "high",
        type: "wealth"
      }
    ],
    salaryBreakdown: {
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
    },
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.profiles.set(email, profile);
  store.portfolios.set(email, []);
  store.chats.set(email, []);

  return {
    email,
    name
  } satisfies SessionUser;
}

export function upsertProfile(email: string, partialProfile: Partial<UserProfile>) {
  const store = getStore();
  const existing = store.profiles.get(email);
  if (!existing) {
    throw new Error("Profile not found");
  }

  const updated: UserProfile = {
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
  };

  store.profiles.set(email, updated);
  return updated;
}

export function getPortfolioByEmail(email: string) {
  return getStore().portfolios.get(email) ?? [];
}

export function setPortfolioByEmail(email: string, funds: PortfolioFund[]) {
  getStore().portfolios.set(email, funds);
  return funds;
}

export function getChatHistory(email: string) {
  return getStore().chats.get(email) ?? [];
}

export function addChatMessage(email: string, message: ChatMessage) {
  const messages = getChatHistory(email);
  getStore().chats.set(email, [...messages, message]);
}
