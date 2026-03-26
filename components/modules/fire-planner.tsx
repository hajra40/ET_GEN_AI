"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateFirePlan } from "@/lib/calculators/fire";
import { generateAISummary } from "@/lib/ai/groq-service";
import { totalInvestments } from "@/lib/calculators/shared";
import type { UserProfile } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function FirePlanner({
  profile
}: {
  profile: UserProfile;
}) {
  const [aiSummary, setAiSummary] = useState<string>("Loading AI insights...");
  const [form, setForm] = useState({
    age: profile.age,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses + profile.loanEmi,
    savings: profile.currentSavings,
    investments: totalInvestments(profile.currentInvestments),
    retirementTargetAge: profile.retirementTargetAge,
    expectedInflation: 6,
    expectedReturnRate: profile.riskAppetite === "aggressive" ? 12 : profile.riskAppetite === "growth" ? 11 : 9
  });

  const result = calculateFirePlan({
    ...form,
    lifeGoals: profile.financialGoals,
    riskAppetite: profile.riskAppetite
  });

  useEffect(() => {
    const context = `Age: ${form.age}, Monthly Income: ${form.monthlyIncome}, Monthly Expenses: ${form.monthlyExpenses}, Current Savings: ${form.savings}, Investments: ${form.investments}, Retirement Target Age: ${form.retirementTargetAge}, On Track: ${result.onTrack}, Target Corpus: ${result.targetRetirementCorpus}, Projected Corpus: ${result.projectedCorpus}, Monthly SIP Required: ${result.monthlySipRequired}, Annual Savings Rate: ${result.annualSavingsRate}%`;
    generateAISummary("Analyze this person's FIRE plan and provide personalized advice on achieving financial independence and early retirement.", context).then(setAiSummary);
  }, [form, result]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FIRE Path Planner"
        title={result.onTrack ? "You are broadly on track" : "Your current plan needs a push"}
        description="Projection math is deterministic and driven by code: inflation-adjusted expenses, SIP future value, and retirement-corpus targets."
        badge={`${formatCurrency(result.monthlySipRequired)} suggested SIP`}
      />

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
                onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
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
            <CardTitle>Year-by-Year Roadmap</CardTitle>
            <CardDescription>Corpus and annual expense estimates based on current assumptions.</CardDescription>
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


      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Mentor Summary</CardTitle>
            <CardDescription>Personalized retirement planning insights powered by AI.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fallback Suggestions</CardTitle>
              <CardDescription>{result.plainEnglishSummary}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.fallbackSuggestions.map((item) => (
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
    </div>
  );
}
