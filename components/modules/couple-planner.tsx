"use client";

import { useEffect, useState } from "react";
import { buildCoupleFactsPacket, buildGroundedSummary } from "@/lib/ai/grounded-explanations";
import { fetchAiSummary } from "@/lib/ai/client";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calculateCouplePlan } from "@/lib/calculators/couple";
import type { UserProfile } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function CouplePlanner({
  currentProfile,
  profiles
}: {
  currentProfile: UserProfile;
  profiles: UserProfile[];
}) {
  const [partnerAEmail, setPartnerAEmail] = useState(currentProfile.email);
  const [partnerBEmail, setPartnerBEmail] = useState(
    profiles.find(
      (profile) => profile.email !== currentProfile.email && profile.maritalStatus === "married"
    )?.email ?? profiles[0].email
  );
  const [sharedMonthlyExpenses, setSharedMonthlyExpenses] = useState(35000);

  const partnerA = profiles.find((profile) => profile.email === partnerAEmail) ?? currentProfile;
  const partnerB = profiles.find((profile) => profile.email === partnerBEmail) ?? profiles[0];
  const result = calculateCouplePlan({
    partnerA,
    partnerB,
    sharedMonthlyExpenses,
    jointGoals: [
      ...partnerA.financialGoals.filter((goal) => goal.type !== "retirement"),
      ...partnerB.financialGoals.filter((goal) => goal.type !== "retirement")
    ]
  });
  const factsPacket = buildCoupleFactsPacket(result);
  const [aiSummary, setAiSummary] = useState<string>(buildGroundedSummary(factsPacket));
  const aiPrompt =
    "Explain the couple-planner facts without inventing shared goals or tax savings beyond the provided data.";
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
        eyebrow="Couple's Money Planner"
        title="Plan jointly without losing individual clarity"
        description="Compare partner-level tax and protection outcomes, then split shared investing with explicit rationale."
        badge="Dual-profile planning"
      />

      <div className="flex flex-wrap gap-3">
        <ConfidenceBadge confidence={result.confidence} />
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Combined income", formatCurrency(result.combinedIncome)],
          ["Combined expenses", formatCurrency(result.combinedExpenses)],
          ["Combined net worth", formatCompactCurrency(result.combinedNetWorth)],
          ["Combined surplus", formatCurrency(result.combinedSurplus ?? 0)],
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
              <CardDescription>Shifted toward the partner with the stronger tax-saving upside.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">{partnerA.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(result.optimizedSipSplit.partnerA)} per month
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">{partnerB.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(result.optimizedSipSplit.partnerB)} per month
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-4 text-sm text-muted-foreground">
              Solo emergency targets total {formatCurrency(result.soloVsJointDelta.soloEmergencyFunds)}
              {" "}versus a joint target of {formatCurrency(result.soloVsJointDelta.jointEmergencyFund)}.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Mentor Summary</CardTitle>
              <CardDescription>Grounded in deterministic couple-planner facts.</CardDescription>
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
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>Side-by-side tax-aware planning options for the household.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(result.scenarioComparisons ?? []).map((scenario) => (
            <div key={scenario.name} className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="font-semibold">{scenario.name}</p>
                <p className="text-sm text-muted-foreground">
                  Combined tax {formatCurrency(scenario.combinedTax)}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {scenario.rationale} Monthly investable amount: {formatCurrency(scenario.monthlyInvestable)}.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Goal Ownership Map</CardTitle>
              <CardDescription>Clarifies who owns each goal or whether it should stay joint.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result.goalOwnershipMap ?? []).map((goal) => (
              <div key={`${goal.goalId}-${goal.owner}`} className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{goal.goalTitle}</p>
                  <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {goal.owner}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{goal.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Insurance and Shared Planning Notes</CardTitle>
              <CardDescription>Protection structure and household workflow suggestions.</CardDescription>
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

      <AssumptionsPanel
        title="Couple-planner assumptions"
        description="Shared-expense, tax-optimization, and protection assumptions driving the split."
        assumptions={result.assumptionsUsed}
        confidence={result.confidence}
        missingInputs={[
          "Exact shared rent and employer benefits for both partners would improve the scenario comparison.",
          "Explicit joint goal amounts and target dates would improve ownership and SIP recommendations."
        ]}
      />
    </div>
  );
}
