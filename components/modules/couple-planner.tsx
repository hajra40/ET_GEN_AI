"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calculateCouplePlan } from "@/lib/calculators/couple";
import { generateAISummary } from "@/lib/ai/groq-service";
import type { UserProfile } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function CouplePlanner({
  currentProfile,
  profiles
}: {
  currentProfile: UserProfile;
  profiles: UserProfile[];
}) {
  const [aiSummary, setAiSummary] = useState<string>("Loading AI insights...");
  const [partnerAEmail, setPartnerAEmail] = useState(currentProfile.email);
  const [partnerBEmail, setPartnerBEmail] = useState(
    profiles.find((profile) => profile.email !== currentProfile.email && profile.maritalStatus === "married")?.email ?? profiles[0].email
  );
  const [sharedMonthlyExpenses, setSharedMonthlyExpenses] = useState(35000);

  const partnerA = profiles.find((profile) => profile.email === partnerAEmail) ?? currentProfile;
  const partnerB = profiles.find((profile) => profile.email === partnerBEmail) ?? profiles[0];
  const result = calculateCouplePlan({
    partnerA,
    partnerB,
    sharedMonthlyExpenses,
    jointGoals: [...partnerA.financialGoals.slice(0, 1), ...partnerB.financialGoals.slice(0, 1)]
  });

  useEffect(() => {
    const context = `Partner A: ${partnerA.name} (Income: ${partnerA.monthlyIncome}, Net Worth: ${formatCompactCurrency(partnerA.currentSavings)}), Partner B: ${partnerB.name} (Income: ${partnerB.monthlyIncome}, Net Worth: ${formatCompactCurrency(partnerB.currentSavings)}), Combined Income: ${result.combinedIncome}, Combined Expenses: ${result.combinedExpenses}, Joint Emergency Target: ${result.jointEmergencyFundTarget}, Partner A SIP: ${result.optimizedSipSplit.partnerA}, Partner B SIP: ${result.optimizedSipSplit.partnerB}`;
    generateAISummary("Analyze this couple's joint financial plan and provide personalized advice on optimizing their combined finances.", context).then(setAiSummary);
  }, [partnerA, partnerB, result]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Couple's Money Planner"
        title="Plan jointly without losing individual clarity"
        description="Compare solo and shared planning, split SIPs intelligently, and turn two financial lives into one coherent system."
        badge="Dual-profile planning"
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Partner Selection</CardTitle>
            <CardDescription>Use seeded profiles or compare solo vs joint planning in demo mode.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Select label="Partner A" value={partnerAEmail} onChange={(event) => setPartnerAEmail(event.target.value)}>
            {profiles.map((profile) => (
              <option key={profile.email} value={profile.email}>
                {profile.name}
              </option>
            ))}
          </Select>
          <Select label="Partner B" value={partnerBEmail} onChange={(event) => setPartnerBEmail(event.target.value)}>
            {profiles.map((profile) => (
              <option key={profile.email} value={profile.email}>
                {profile.name}
              </option>
            ))}
          </Select>
          <Input
            label="Shared monthly expenses"
            helperText="Rent, groceries, utilities, and other shared costs."
            type="number"
            value={sharedMonthlyExpenses}
            onChange={(event) => setSharedMonthlyExpenses(Number(event.target.value))}
            placeholder="e.g. 35000"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Combined income", formatCurrency(result.combinedIncome)],
          ["Combined expenses", formatCurrency(result.combinedExpenses)],
          ["Combined net worth", formatCompactCurrency(result.combinedNetWorth)],
          ["Joint emergency target", formatCurrency(result.jointEmergencyFundTarget)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Optimized SIP Split</CardTitle>
              <CardDescription>Income-weighted split of the suggested joint investing amount.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">{partnerA.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(result.optimizedSipSplit.partnerA)} per month</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">{partnerB.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(result.optimizedSipSplit.partnerB)} per month</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-4 text-sm text-muted-foreground">
              Solo emergency targets total {formatCurrency(result.soloVsJointDelta.soloEmergencyFunds)} versus a joint target of {formatCurrency(result.soloVsJointDelta.jointEmergencyFund)}.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Mentor Summary</CardTitle>
        <CardDescription>Personalized couple financial planning insights powered by AI.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Insurance & Tax Suggestions</CardTitle>
            <CardDescription>High-level rules for shared planning efficiency.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...result.highLevelSuggestions, ...result.insuranceSplitRecommendations].map((item) => (
            <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}