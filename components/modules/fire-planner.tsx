"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildFireFactsPacket, buildGroundedSummary } from "@/lib/ai/grounded-explanations";
import { fetchAiSummary } from "@/lib/ai/client";
import { getInflationDefault, getRiskAdjustedReturn } from "@/lib/config/finance-assumptions";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { totalInvestments } from "@/lib/calculators/shared";
import type { UserProfile } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const tabs = ["monthly", "goals", "assumptions", "actions"] as const;

export function FirePlanner({
  profile
}: {
  profile: UserProfile;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("monthly");
  const [form, setForm] = useState({
    age: profile.age,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
    savings: profile.currentSavings,
    investments: totalInvestments(profile.currentInvestments),
    retirementTargetAge: profile.retirementTargetAge,
    expectedInflation: getInflationDefault(),
    expectedReturnRate: getRiskAdjustedReturn(profile.riskAppetite)
  });

  const result = calculateFirePlan({
    ...form,
    lifeGoals: profile.financialGoals,
    riskAppetite: profile.riskAppetite,
    currentEmergencyFund: profile.emergencyFund,
    insuranceCoverage: profile.insuranceCoverage,
    dependents: profile.dependents,
    maritalStatus: profile.maritalStatus,
    cityType: profile.cityType,
    employerBenefits: profile.employerBenefits,
    debtDetails: profile.debtDetails,
    salaryBreakdown: profile.salaryBreakdown
  });
  const factsPacket = buildFireFactsPacket(result);
  const [aiSummary, setAiSummary] = useState<string>(buildGroundedSummary(factsPacket));
  const aiPrompt =
    "Explain the FIRE plan using only the provided structured facts. Do not invent numbers.";
  const aiContext = JSON.stringify(factsPacket);

  useEffect(() => {
    setAiSummary(buildGroundedSummary(factsPacket));
  }, [factsPacket]);

  useEffect(() => {
    let active = true;

    void fetchAiSummary(aiPrompt, aiContext).then((summary) => {
      if (active) {
        setAiSummary(summary);
      }
    });

    return () => {
      active = false;
    };
  }, [aiPrompt, aiContext]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FIRE Path Planner"
        title={result.onTrack ? "You are broadly on track" : "Your current plan needs a push"}
        description="Projection math remains deterministic, but the roadmap now separates emergency cash, protection gaps, goals, and retirement contributions month by month."
        badge={`${formatCurrency(result.monthlySipRequired)} retirement SIP target`}
      />

      <div className="flex flex-wrap gap-3">
        <ConfidenceBadge confidence={result.confidence} />
        {result.goalFundingPlan?.underfundedItems.length ? (
          <Badge className="bg-amber-100 text-amber-900">
            {result.goalFundingPlan.underfundedItems.length} underfunded items
          </Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-800">No major funding shortfall flagged</Badge>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Adjust assumptions live to test your retirement path.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              ["age", "Current age", "Your current age in years"],
              ["monthlyIncome", "Monthly income", "Take-home salary after deductions"],
              ["monthlyExpenses", "Monthly expenses + EMI", "Total monthly outflow including loan EMI"],
              ["savings", "Current savings", "Bank balance and liquid savings"],
              ["investments", "Current investments", "Total current investment value"],
              ["retirementTargetAge", "Retirement age", "Age at which you want to retire"],
              ["expectedInflation", "Inflation %", "Expected annual inflation rate"],
              ["expectedReturnRate", "Expected return %", "Expected annual investment return"]
            ].map(([key, label, helperText]) => (
              <Input
                key={key}
                label={label}
                helperText={helperText}
                type="number"
                value={form[key as keyof typeof form]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: Number(event.target.value)
                  }))
                }
                placeholder="e.g. 10"
              />
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Target corpus", formatCompactCurrency(result.targetRetirementCorpus)],
            ["Projected corpus", formatCompactCurrency(result.projectedCorpus)],
            ["Annual savings rate", `${result.annualSavingsRate}%`],
            ["Emergency fund target", formatCurrency(result.emergencyFundTarget)]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <div>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Yearly Summary</CardTitle>
            <CardDescription>Retirement corpus and annual expense estimates based on current assumptions.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.yearByYearRoadmap}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `${Math.round(value / 100000)}L`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line dataKey="projectedCorpus" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={false} />
              <Line dataKey="inflationAdjustedExpense" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "monthly"
              ? "Monthly plan"
              : tab === "goals"
                ? "Goal funding"
                : tab === "assumptions"
                  ? "Assumptions"
                  : "What to do now"}
          </Button>
        ))}
      </div>

      {activeTab === "monthly" ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Month-by-Month Roadmap</CardTitle>
              <CardDescription>Why each month looks the way it does under the current funding waterfall.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result.monthlyRoadmap ?? []).slice(0, 12).map((item) => (
              <div
                key={item.isoMonth}
                className="rounded-2xl border border-border/70 bg-secondary/30 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{item.monthLabel}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.whyThisMonthLooksLikeThis}
                    </p>
                  </div>
                  <Badge>{formatCurrency(item.expectedCumulativeCorpus)} cumulative</Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    Retirement SIP: {formatCurrency(item.retirementSipContribution)}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    Emergency fund: {formatCurrency(item.emergencyFundContribution)}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    Goals: {formatCurrency(item.goalSipContributions.reduce((sum, goal) => sum + goal.amount, 0))}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    {item.taxOptimizationNote ?? item.insuranceAction ?? "No special note this month"}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "goals" ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Goal Funding Waterfall</CardTitle>
              <CardDescription>Emergency fund first, then protection, urgent goals, retirement, and the rest.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.goalFundingPlan?.waterfall.map((item) => (
              <div key={`${item.bucket}-${item.label}`} className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.label}</p>
                  <Badge>{formatCurrency(item.allocatedAmount)} allocated</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.rationale} Required {formatCurrency(item.requiredAmount)}. Shortfall {formatCurrency(item.shortfall)}.
                </p>
              </div>
            ))}
            {result.goalFundingPlan?.goalStatuses.map((goal) => (
              <div key={goal.goalId} className="rounded-2xl border border-border/70 bg-white p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{goal.explanation}</p>
                  </div>
                  <Badge>{goal.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <p className="text-sm text-muted-foreground">Required SIP: {formatCurrency(goal.requiredMonthlySip)}</p>
                  <p className="text-sm text-muted-foreground">Allocated SIP: {formatCurrency(goal.recommendedMonthlySip)}</p>
                  <p className="text-sm text-muted-foreground">Future value: {formatCurrency(goal.inflationAdjustedFutureValue)}</p>
                  <p className="text-sm text-muted-foreground">{goal.recommendedAssetBucket}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "assumptions" ? (
        <AssumptionsPanel
          title="FIRE assumptions"
          description="These assumptions drive the funding waterfall, roadmap, and retirement target."
          assumptions={result.assumptionsUsed}
          confidence={result.confidence}
          missingInputs={result.goalFundingPlan?.underfundedItems}
        />
      ) : null}

      {activeTab === "actions" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>What to Do Now</CardTitle>
                <CardDescription>{result.plainEnglishSummary}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(result.whatToDoNow ?? []).map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Allocation Guidance</CardTitle>
                <CardDescription>Suggested glide path by life stage.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.assetAllocationGuidance.map((item) => (
                <div key={item.lifeStage} className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.lifeStage}</p>
                    <Badge>{item.equity}% equity</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description} Debt {item.debt}%, gold {item.gold}%, cash {item.cash}%.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Mentor Summary</CardTitle>
            <CardDescription>Grounded in deterministic facts, then optionally refined by AI.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
