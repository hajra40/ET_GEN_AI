import { NextResponse } from "next/server";
import { clearSession, getServerSession } from "@/lib/auth/session";
import type { UserProfile } from "@/lib/types";
import { onboardingSchema } from "@/lib/types";
import { getProfileByEmail, upsertProfile } from "@/lib/data/store";

function sanitizeProfile(profile: UserProfile | null) {
  if (!profile) {
    return null;
  }

  const { password, ...rest } = profile;
  return rest;
}

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByEmail(session.email);
  if (!profile) {
    clearSession();
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: sanitizeProfile(profile) });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid profile payload." }, { status: 400 });
  }

  try {
    const updated = await upsertProfile(session.email, {
      name: parsed.data.name,
      city: parsed.data.city,
      age: parsed.data.age,
      maritalStatus: parsed.data.maritalStatus,
      dependents: parsed.data.dependents,
      monthlyIncome: parsed.data.monthlyIncome,
      monthlyExpenses: parsed.data.monthlyExpenses,
      loanEmi: parsed.data.loanEmi,
      currentSavings: parsed.data.currentSavings,
      emergencyFund: parsed.data.emergencyFund,
      insuranceCoverage: {
        lifeCover: parsed.data.lifeCover,
        healthCover: parsed.data.healthCover,
        disabilityCover: parsed.data.disabilityCover,
        personalAccidentCover: parsed.data.personalAccidentCover
      },
      currentInvestments: {
        equity: parsed.data.equity,
        debt: parsed.data.debt,
        gold: parsed.data.gold,
        cash: parsed.data.cash,
        epf: parsed.data.epf,
        ppf: parsed.data.ppf,
        nps: parsed.data.nps,
        international: parsed.data.international,
        alternatives: parsed.data.alternatives
      },
      riskAppetite: parsed.data.riskAppetite,
      retirementTargetAge: parsed.data.retirementTargetAge,
      taxRegimePreference: parsed.data.taxRegimePreference,
      financialGoals: parsed.data.financialGoals,
      onboardingCompleted: true
    });

    return NextResponse.json({ profile: sanitizeProfile(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save profile.";
    const status = message === "Profile not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
