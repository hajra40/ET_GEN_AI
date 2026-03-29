"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from "recharts";
import { buildGroundedSummary, buildMoneyHealthFactsPacket } from "@/lib/ai/grounded-explanations";
import { fetchAiSummary } from "@/lib/ai/client";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MoneyHealthScoreResult } from "@/lib/types";
import { getStatusTone } from "@/lib/utils";

export function MoneyHealthPanel({
  result
}: {
  result: MoneyHealthScoreResult;
}) {
  const factsPacket = buildMoneyHealthFactsPacket(result);
  const [aiSummary, setAiSummary] = useState<string>(buildGroundedSummary(factsPacket));
  const aiPrompt =
    "Explain the money-health facts in plain language without inventing numbers or certainty.";
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
        eyebrow="Money Health Score"
        title={`${result.overallScore}/100 Financial Wellness`}
        description="A rules-based scorecard covering liquidity, protection, diversification, debt, tax, and retirement readiness with visible score drivers."
        badge="Deterministic, explainable"
      />

      <div className="flex flex-wrap gap-3">
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Score Radar</CardTitle>
              <CardDescription>Visual summary across all six dimensions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={result.dimensions}>
                <PolarGrid />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Dimension Breakdown</CardTitle>
              <CardDescription>{result.narrative}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.dimensions.map((dimension) => (
              <div
                key={dimension.key}
                className="space-y-3 rounded-2xl border border-border/70 bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{dimension.label}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {dimension.explanation}
                    </p>
                  </div>
                  <p className={`text-lg font-semibold ${getStatusTone(dimension.score)}`}>
                    {dimension.score}
                  </p>
                </div>
                <Progress value={dimension.score} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Reason:</span> {dimension.reason}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Top action:</span> {dimension.topAction}
                  </div>
                </div>
                {dimension.missingData?.length ? (
                  <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    {dimension.missingData.join(" ")}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Score Drivers</CardTitle>
              <CardDescription>The main reasons the score is where it is right now.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result.scoreDrivers ?? []).map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>How to Improve by 30 Points</CardTitle>
              <CardDescription>Highest-leverage next steps from the weakest dimensions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result.howToImproveBy30Points ?? []).map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AssumptionsPanel
        title="Money-health assumptions"
        description="Visible assumptions, confidence, and the missing data that could move this score."
        assumptions={result.assumptionsUsed}
        confidence={result.confidence}
        missingInputs={result.missingDataThatCouldChangeThis}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Mentor Summary</CardTitle>
            <CardDescription>Grounded in deterministic score drivers, then optionally refined by AI.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
        </CardContent>
      </Card>

      <RecommendationList items={result.recommendations} />
    </div>
  );
}
