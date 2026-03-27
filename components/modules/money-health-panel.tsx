"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchAiSummary } from "@/lib/ai/client";
import type { MoneyHealthScoreResult } from "@/lib/types";
import { getStatusTone } from "@/lib/utils";

export function MoneyHealthPanel({
  result
}: {
  result: MoneyHealthScoreResult;
}) {
  const [aiSummary, setAiSummary] = useState<string>("Loading AI insights...");
  const aiPrompt = "Analyze this person's money health score and provide personalized advice on how to improve their financial wellness.";
  const aiContext = `Overall Score: ${result.overallScore}/100. Dimensions: ${result.dimensions.map((dimension) => `${dimension.label}: ${dimension.score}/100`).join(", ")}. Narrative: ${result.narrative}`;

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
        description="A rules-based scorecard covering emergency preparedness, insurance, diversification, debt, tax, and retirement readiness."
        badge="Deterministic, not random"
      />

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
                <Radar dataKey="score" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.4} />
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
              <div key={dimension.key} className="space-y-2 rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{dimension.label}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{dimension.explanation}</p>
                  </div>
                  <p className={`text-lg font-semibold ${getStatusTone(dimension.score)}`}>{dimension.score}</p>
                </div>
                <Progress value={dimension.score} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Mentor Summary</CardTitle>
            <CardDescription>Personalized insights powered by AI.</CardDescription>
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
