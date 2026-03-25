"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsightPromptContext, UserProfile } from "@/lib/types";
import { currentNetWorth, monthlySurplus } from "@/lib/calculators/shared";
import { formatCompactCurrency, formatCurrency, formatPercentage } from "@/lib/utils";

const quickActions = [
  { href: "/money-health", label: "Review score" },
  { href: "/fire-planner", label: "Run FIRE plan" },
  { href: "/tax-wizard", label: "Compare taxes" },
  { href: "/portfolio-xray", label: "Scan portfolio" },
  { href: "/insights", label: "Ask AI mentor" }
];

export function DashboardOverview({
  profile,
  context
}: {
  profile: UserProfile;
  context: InsightPromptContext;
}) {
  const netWorth = currentNetWorth(profile);
  const surplus = monthlySurplus(profile);
  const emergencyRatio = profile.emergencyFund / Math.max(context.firePlan.emergencyFundTarget, 1);
  const scoreData = context.moneyHealth.dimensions.map((dimension) => ({
    name: dimension.label,
    score: dimension.score
  }));
  const allocationData = context.portfolioXRay.assetAllocation.map((item) => ({
    name: item.category,
    value: item.value
  }));
  const roadmapData = context.firePlan.yearByYearRoadmap.slice(0, 8).map((item) => ({
    year: item.year,
    corpus: item.projectedCorpus / 100000,
    expense: item.inflationAdjustedExpense / 100000
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${profile.name.split(" ")[0]}`}
        description="A single command center for your money health, retirement path, taxes, goals, and portfolio decisions."
        badge={`${context.moneyHealth.overallScore}/100 Money Health Score`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Net worth"
          value={formatCompactCurrency(netWorth)}
          subtitle="Cash + investments across all tracked buckets."
          trend="up"
        />
        <MetricCard
          title="Monthly surplus"
          value={formatCurrency(surplus)}
          subtitle="Available after expenses and EMI."
          trend={surplus > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Emergency fund"
          value={formatPercentage(emergencyRatio * 100)}
          subtitle={`${formatCurrency(profile.emergencyFund)} saved vs ${formatCurrency(context.firePlan.emergencyFundTarget)} target.`}
          trend={emergencyRatio >= 1 ? "up" : "flat"}
        />
        <MetricCard
          title="Tax optimization"
          value={context.taxResult.bestRegime.toUpperCase()}
          subtitle={`Estimated savings edge: ${formatCurrency(context.taxResult.savingsDifference)}.`}
          trend="flat"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Money Health Breakdown</CardTitle>
              <CardDescription>Deterministic scoring across six personal finance pillars.</CardDescription>
            </div>
            <Badge>{context.moneyHealth.narrative}</Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-10} height={56} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump straight to the most useful workflows for a demo.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.href} asChild variant="outline" className="w-full justify-between">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Retirement Roadmap Snapshot</CardTitle>
              <CardDescription>Corpus and annual expense projections for the next several years.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roadmapData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${value}L`} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)} lakh`} />
                <Line dataKey="corpus" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={false} />
                <Line dataKey="expense" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Current mutual fund and asset mix from the seeded portfolio.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            {allocationData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} fill="hsl(var(--chart-3))" paddingAngle={3} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Add or import portfolio holdings to see allocation analytics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <RecommendationList items={context.moneyHealth.recommendations} />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Priority goals collected during onboarding.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.financialGoals.map((goal) => (
              <div key={goal.id} className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{goal.title}</p>
                  <Badge>{goal.priority}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Target {formatCurrency(goal.targetAmount)} by {goal.targetYear}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
