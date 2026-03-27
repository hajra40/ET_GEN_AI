"use client";

import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip } from "recharts";
import { Plus, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculatePortfolioXRay } from "@/lib/calculators/portfolio";
import { fetchAiSummary } from "@/lib/ai/client";
import type { PortfolioFund } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PortfolioXRay({
  initialFunds
}: {
  initialFunds: PortfolioFund[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [aiSummary, setAiSummary] = useState<string>("Loading AI insights...");
  const [funds, setFunds] = useState<PortfolioFund[]>(
    initialFunds.length
      ? initialFunds
      : [
          {
            fundName: "Manual Fund",
            category: "Equity",
            investedAmount: 100000,
            currentValue: 110000,
            expenseRatio: 1,
            benchmarkReturn: 11,
            annualizedReturn: 10,
            styleTags: ["core"],
            topHoldings: [
              { name: "HDFC Bank", weight: 6 },
              { name: "Reliance Industries", weight: 5 },
              { name: "ICICI Bank", weight: 4 }
            ]
          }
        ]
  );
  const [message, setMessage] = useState("");
  const result = calculatePortfolioXRay(funds);
  const aiPrompt = "Analyze this mutual fund portfolio and provide personalized advice on rebalancing, reducing costs, and improving returns.";
  const aiContext = `Number of Funds: ${funds.length}, Total Invested: ${formatCurrency(funds.reduce((sum, fund) => sum + fund.investedAmount, 0))}, Current Value: ${formatCurrency(funds.reduce((sum, fund) => sum + fund.currentValue, 0))}, XIRR: ${result.xirrApproximation}%, Expense Drag: ${formatCurrency(result.expenseRatioDragEstimate)}, Portfolio Return: ${result.benchmarkComparison.portfolioReturn}%, Benchmark: ${result.benchmarkComparison.benchmarkReturn}%`;

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

  async function importPortfolio(file: File) {
    const formData = new FormData();
    formData.append("kind", "portfolio");
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as { funds?: PortfolioFund[]; message?: string };
    if (data.funds?.length) {
      setFunds(data.funds);
    }
    setMessage(data.message ?? "Imported portfolio.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mutual Fund Portfolio X-Ray"
        title="Look through the fund names into actual exposures"
        description="Manual entry, CSV upload, and placeholder CAMS/KFintech PDF flow are all supported, with deterministic overlap and cost analysis."
        badge={`${result.xirrApproximation}% approx. annualized return`}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Portfolio Input</CardTitle>
            <CardDescription>Enter funds manually or import a sample CSV/PDF statement.</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload CSV / PDF
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setFunds((current) => [
                  ...current,
                  {
                    fundName: "New Fund",
                    category: "Equity",
                    investedAmount: 100000,
                    currentValue: 100000,
                    expenseRatio: 1,
                    benchmarkReturn: 11,
                    annualizedReturn: 10,
                    styleTags: ["core"],
                    topHoldings: [
                      { name: "HDFC Bank", weight: 6 },
                      { name: "Reliance Industries", weight: 5 },
                      { name: "ICICI Bank", weight: 4 }
                    ]
                  }
                ])
              }
            >
              <Plus className="h-4 w-4" />
              Add fund
            </Button>
          </div>
          <Input
            ref={fileRef}
            type="file"
            accept=".csv,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importPortfolio(file);
              }
            }}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {message ? <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
          {funds.map((fund, index) => (
            <div key={`${fund.fundName}-${index}`} className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-6">
              <Input label="Fund name" value={fund.fundName} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fundName: event.target.value } : item))} placeholder="e.g. HDFC Mid-Cap Opportunities" />
              <Input label="Category" value={fund.category} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value } : item))} placeholder="e.g. Equity" />
              <Input label="Invested amount" type="number" value={fund.investedAmount} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, investedAmount: Number(event.target.value) } : item))} placeholder="e.g. 100000" />
              <Input label="Current value" type="number" value={fund.currentValue} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, currentValue: Number(event.target.value) } : item))} placeholder="e.g. 110000" />
              <Input label="Expense ratio %" type="number" value={fund.expenseRatio} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, expenseRatio: Number(event.target.value) } : item))} placeholder="e.g. 1.5" />
              <Input label="Annualized return %" type="number" value={fund.annualizedReturn} onChange={(event) => setFunds((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, annualizedReturn: Number(event.target.value) } : item))} placeholder="e.g. 12" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Reconstructed from the current portfolio value of each fund.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Pie data={result.assetAllocation} dataKey="value" nameKey="category" innerRadius={72} outerRadius={110} fill="hsl(var(--chart-1))" paddingAngle={3} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Expense ratio drag</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(result.expenseRatioDragEstimate)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Estimated annual rupee drag from current expense ratios.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Benchmark comparison</CardDescription>
              <CardTitle className="text-2xl">
                {result.benchmarkComparison.portfolioReturn}% vs {result.benchmarkComparison.benchmarkReturn}%
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Approximate alpha: {result.benchmarkComparison.alpha}%.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Warnings & Rebalancing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...result.concentrationWarnings, ...result.rebalancingSuggestions].map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>


      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Mentor Summary</CardTitle>
            <CardDescription>Personalized portfolio insights powered by AI.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Fund Overlap Analysis</CardTitle>
            <CardDescription>Look for duplicated large-cap exposure and style clustering.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Pair</TableHead>
                <TableHead>Overlap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.fundOverlap.map((item) => (
                <TableRow key={item.pair}>
                  <TableCell>{item.pair}</TableCell>
                  <TableCell>{item.overlapPercent}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
