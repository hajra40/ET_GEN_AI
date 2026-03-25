import { z } from "zod";
import {
  maritalStatuses,
  riskAppetites,
  taxRegimes,
  lifeEventTypes
} from "@/lib/types/finance";

export const goalSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  targetAmount: z.coerce.number().min(10000),
  targetYear: z.coerce.number().min(new Date().getFullYear()),
  priority: z.enum(["high", "medium", "low"]),
  type: z.enum(["retirement", "home", "education", "travel", "wealth", "wedding", "other"])
});

export const onboardingSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  age: z.coerce.number().min(18).max(75),
  maritalStatus: z.enum(maritalStatuses),
  dependents: z.coerce.number().min(0).max(10),
  monthlyIncome: z.coerce.number().min(10000),
  monthlyExpenses: z.coerce.number().min(0),
  loanEmi: z.coerce.number().min(0),
  currentSavings: z.coerce.number().min(0),
  emergencyFund: z.coerce.number().min(0),
  lifeCover: z.coerce.number().min(0),
  healthCover: z.coerce.number().min(0),
  disabilityCover: z.coerce.number().min(0),
  personalAccidentCover: z.coerce.number().min(0),
  equity: z.coerce.number().min(0),
  debt: z.coerce.number().min(0),
  gold: z.coerce.number().min(0),
  cash: z.coerce.number().min(0),
  epf: z.coerce.number().min(0),
  ppf: z.coerce.number().min(0),
  nps: z.coerce.number().min(0),
  international: z.coerce.number().min(0),
  alternatives: z.coerce.number().min(0),
  riskAppetite: z.enum(riskAppetites),
  retirementTargetAge: z.coerce.number().min(40).max(75),
  taxRegimePreference: z.enum(taxRegimes),
  financialGoals: z.array(goalSchema).min(1)
});

export const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6)
});

export const taxWizardSchema = z.object({
  annualGrossSalary: z.coerce.number().min(0),
  basicSalary: z.coerce.number().min(0),
  hraReceived: z.coerce.number().min(0),
  annualRentPaid: z.coerce.number().min(0),
  cityType: z.enum(["metro", "non_metro"]),
  bonus: z.coerce.number().min(0),
  employerPf: z.coerce.number().min(0),
  professionalTax: z.coerce.number().min(0),
  section80c: z.coerce.number().min(0),
  section80d: z.coerce.number().min(0),
  npsEmployee: z.coerce.number().min(0),
  npsEmployer: z.coerce.number().min(0),
  homeLoanInterest: z.coerce.number().min(0),
  otherDeductions: z.coerce.number().min(0)
});

export const lifeEventSchema = z.object({
  eventType: z.enum(lifeEventTypes),
  answers: z.record(z.union([z.string(), z.number()]))
});

export const portfolioCsvUploadSchema = z.object({
  kind: z.enum(["portfolio", "form16"]),
  fileName: z.string().min(1)
});
