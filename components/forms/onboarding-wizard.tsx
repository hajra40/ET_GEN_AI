"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { onboardingSchema } from "@/lib/types";
import type { Goal, UserProfile } from "@/lib/types";

const steps = [
  "Personal",
  "Cashflow",
  "Protection",
  "Investments",
  "Goals"
];

function nextYear(offset: number) {
  return new Date().getFullYear() + offset;
}

export function OnboardingWizard({
  profile
}: {
  profile: UserProfile;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: profile.name,
    city: profile.city,
    age: profile.age,
    maritalStatus: profile.maritalStatus,
    dependents: profile.dependents,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses,
    loanEmi: profile.loanEmi,
    currentSavings: profile.currentSavings,
    emergencyFund: profile.emergencyFund,
    lifeCover: profile.insuranceCoverage.lifeCover,
    healthCover: profile.insuranceCoverage.healthCover,
    disabilityCover: profile.insuranceCoverage.disabilityCover,
    personalAccidentCover: profile.insuranceCoverage.personalAccidentCover,
    equity: profile.currentInvestments.equity,
    debt: profile.currentInvestments.debt,
    gold: profile.currentInvestments.gold,
    cash: profile.currentInvestments.cash,
    epf: profile.currentInvestments.epf,
    ppf: profile.currentInvestments.ppf,
    nps: profile.currentInvestments.nps,
    international: profile.currentInvestments.international,
    alternatives: profile.currentInvestments.alternatives,
    riskAppetite: profile.riskAppetite,
    retirementTargetAge: profile.retirementTargetAge,
    taxRegimePreference: profile.taxRegimePreference
  });
  const [goals, setGoals] = useState<Goal[]>(
    profile.financialGoals.length
      ? profile.financialGoals
      : [
          {
            id: "goal-1",
            title: "Emergency reserve",
            targetAmount: 300000,
            targetYear: nextYear(1),
            priority: "high",
            type: "wealth"
          }
        ]
  );

  function updateField(name: string, value: string | number) {
    setForm((current) => ({
      ...current,
      [name]: typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value
    }));
  }

  function updateGoal(goalId: string, field: keyof Goal, value: string | number) {
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? { ...goal, [field]: value } : goal))
    );
  }

  async function handleSave() {
    const parsed = onboardingSchema.safeParse({
      ...form,
      financialGoals: goals
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please complete the missing fields.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save profile.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Onboarding Wizard</p>
        <h1 className="text-3xl font-semibold">Your 5-minute money setup</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Capture the profile, cash-flow, insurance, investments, retirement target, goals, and tax preference that power every recommendation in the app.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{steps[step]}</CardTitle>
              <CardDescription>Step {step + 1} of {steps.length}</CardDescription>
            </div>
            <div className="w-full max-w-sm">
              <Progress value={((step + 1) / steps.length) * 100} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Full name" />
              <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="City" />
              <Input type="number" value={form.age} onChange={(event) => updateField("age", event.target.value)} placeholder="Age" />
              <Select value={form.maritalStatus} onChange={(event) => updateField("maritalStatus", event.target.value)}>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="engaged">Engaged</option>
                <option value="divorced">Divorced</option>
              </Select>
              <Input type="number" value={form.dependents} onChange={(event) => updateField("dependents", event.target.value)} placeholder="Dependents" />
              <Select value={form.riskAppetite} onChange={(event) => updateField("riskAppetite", event.target.value)}>
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="growth">Growth</option>
                <option value="aggressive">Aggressive</option>
              </Select>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="number" value={form.monthlyIncome} onChange={(event) => updateField("monthlyIncome", event.target.value)} placeholder="Monthly income" />
              <Input type="number" value={form.monthlyExpenses} onChange={(event) => updateField("monthlyExpenses", event.target.value)} placeholder="Monthly expenses" />
              <Input type="number" value={form.loanEmi} onChange={(event) => updateField("loanEmi", event.target.value)} placeholder="Loan EMI" />
              <Input type="number" value={form.currentSavings} onChange={(event) => updateField("currentSavings", event.target.value)} placeholder="Current savings" />
              <Input type="number" value={form.emergencyFund} onChange={(event) => updateField("emergencyFund", event.target.value)} placeholder="Emergency fund" />
              <Input type="number" value={form.retirementTargetAge} onChange={(event) => updateField("retirementTargetAge", event.target.value)} placeholder="Retirement target age" />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="number" value={form.lifeCover} onChange={(event) => updateField("lifeCover", event.target.value)} placeholder="Life cover" />
              <Input type="number" value={form.healthCover} onChange={(event) => updateField("healthCover", event.target.value)} placeholder="Health cover" />
              <Input type="number" value={form.disabilityCover} onChange={(event) => updateField("disabilityCover", event.target.value)} placeholder="Disability cover" />
              <Input type="number" value={form.personalAccidentCover} onChange={(event) => updateField("personalAccidentCover", event.target.value)} placeholder="Personal accident cover" />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["equity", "Equity"],
                ["debt", "Debt"],
                ["gold", "Gold"],
                ["cash", "Cash"],
                ["epf", "EPF"],
                ["ppf", "PPF"],
                ["nps", "NPS"],
                ["international", "International"],
                ["alternatives", "Alternatives"]
              ].map(([key, label]) => (
                <Input
                  key={key}
                  type="number"
                  value={form[key as keyof typeof form] as number}
                  onChange={(event) => updateField(key, event.target.value)}
                  placeholder={label}
                />
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={form.taxRegimePreference} onChange={(event) => updateField("taxRegimePreference", event.target.value)}>
                  <option value="unsure">Unsure</option>
                  <option value="old">Old tax regime</option>
                  <option value="new">New tax regime</option>
                </Select>
                <Textarea value={goals.map((goal) => goal.title).join(", ")} readOnly />
              </div>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-[2fr,1fr,1fr,1fr,auto]">
                    <Input value={goal.title} onChange={(event) => updateGoal(goal.id, "title", event.target.value)} placeholder="Goal name" />
                    <Input type="number" value={goal.targetAmount} onChange={(event) => updateGoal(goal.id, "targetAmount", Number(event.target.value))} placeholder="Target amount" />
                    <Input type="number" value={goal.targetYear} onChange={(event) => updateGoal(goal.id, "targetYear", Number(event.target.value))} placeholder="Year" />
                    <Select value={goal.priority} onChange={(event) => updateGoal(goal.id, "priority", event.target.value)}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Select>
                    <Button variant="ghost" type="button" onClick={() => setGoals((current) => current.filter((item) => item.id !== goal.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setGoals((current) => [
                    ...current,
                    {
                      id: `goal-${Date.now()}`,
                      title: "New goal",
                      targetAmount: 500000,
                      targetYear: nextYear(3),
                      priority: "medium",
                      type: "wealth"
                    }
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Add goal
              </Button>
            </div>
          ) : null}

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}>Next</Button>
            ) : (
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
