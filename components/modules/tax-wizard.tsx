"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { buildGroundedSummary, buildTaxFactsPacket } from "@/lib/ai/grounded-explanations";
import { fetchAiSummary } from "@/lib/ai/client";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { SourceBadge } from "@/components/shared/source-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import type { ConfidenceBadge as ConfidenceBadgeModel, TaxWizardInput, UserProfile } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function TaxWizard({
  profile
}: {
  profile: UserProfile;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<TaxWizardInput>({
    annualGrossSalary: profile.salaryBreakdown.annualGrossSalary,
    basicSalary: profile.salaryBreakdown.basicSalary,
    hraReceived: profile.salaryBreakdown.hraReceived,
    annualRentPaid: profile.monthlyExpenses * 12 * 0.55,
    cityType: ["mumbai", "delhi", "kolkata", "chennai", "bengaluru", "bangalore"].includes(
      profile.city.toLowerCase()
    )
      ? "metro"
      : "non_metro",
    bonus: profile.salaryBreakdown.bonus,
    employerPf: profile.salaryBreakdown.employerPf,
    professionalTax: profile.salaryBreakdown.professionalTax,
    section80c: profile.salaryBreakdown.section80c,
    section80d: profile.salaryBreakdown.section80d,
    npsEmployee: profile.salaryBreakdown.npsEmployee,
    npsEmployer: profile.salaryBreakdown.npsEmployer,
    homeLoanInterest: profile.salaryBreakdown.homeLoanInterest,
    otherDeductions: profile.salaryBreakdown.otherDeductions,
    dataQuality: "exact",
    sourceLabel: "User entered"
  });
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadConfidence, setUploadConfidence] = useState<ConfidenceBadgeModel | undefined>();
  const result = compareTaxRegimes(form);
  const factsPacket = buildTaxFactsPacket(result);
  const [aiSummary, setAiSummary] = useState<string>(buildGroundedSummary(factsPacket));
  const aiPrompt =
    "Explain the tax comparison using only the structured facts. Do not invent deductions or guarantees.";
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

  async function uploadForm16(file: File) {
    const formData = new FormData();
    formData.append("kind", "form16");
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as {
      extracted?: TaxWizardInput;
      message?: string;
      confidence?: ConfidenceBadgeModel;
    };
    if (data.extracted) {
      setForm(data.extracted);
    }
    setUploadConfidence(data.confidence);
    setUploadMessage(data.message ?? "Form 16 upload processed.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tax Wizard"
        title={`Best regime right now: ${result.bestRegime.toUpperCase()}`}
        description="Compare old and new tax regimes for salaried Indian users with versioned rules, deduction analysis, and confidence-aware upload handling."
        badge={result.taxYear ?? "Current tax year"}
      />

      <div className="flex flex-wrap gap-3">
        <ConfidenceBadge confidence={result.confidence} />
        <SourceBadge source={result.source} />
        {uploadConfidence ? <ConfidenceBadge confidence={uploadConfidence} /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Salary Inputs</CardTitle>
              <CardDescription>Manual entry or confidence-aware Form 16 upload.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Form 16
            </Button>
            <Input
              ref={fileRef}
              type="file"
              accept=".pdf,.csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadForm16(file);
                }
              }}
            />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              ["annualGrossSalary", "Annual gross salary", "Total CTC before deductions"],
              ["basicSalary", "Basic salary", "Basic component of your salary"],
              ["hraReceived", "HRA received", "House Rent Allowance from employer"],
              ["annualRentPaid", "Annual rent paid", "Total rent paid in the year"],
              ["bonus", "Bonus", "Performance bonus, joining bonus, etc."],
              ["professionalTax", "Professional tax", "Professional tax deducted"],
              ["section80c", "Section 80C", "PPF, ELSS, life insurance premiums"],
              ["section80d", "Section 80D", "Health insurance premiums"],
              ["npsEmployee", "NPS employee", "Your NPS contribution under 80CCD(1B)"],
              ["npsEmployer", "NPS employer", "Employer's NPS contribution"],
              ["homeLoanInterest", "Home loan interest", "Interest paid on home loan"],
              ["otherDeductions", "Other deductions", "Other eligible deductions"]
            ].map(([key, label, helperText]) => (
              <Input
                key={key}
                label={label}
                helperText={helperText}
                type="number"
                value={form[key as keyof TaxWizardInput] as number}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                    dataQuality: "exact",
                    sourceLabel: "User edited"
                  }))
                }
                placeholder="e.g. 50000"
              />
            ))}
            <Select
              label="City type"
              helperText="Metro cities get higher HRA exemption."
              value={form.cityType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cityType: event.target.value as TaxWizardInput["cityType"]
                }))
              }
            >
              <option value="metro">Metro city</option>
              <option value="non_metro">Non-metro city</option>
            </Select>
            {uploadMessage ? (
              <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                {uploadMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Old Regime Tax</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(result.oldRegimeTax)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Taxable income: {formatCurrency(result.oldTaxableIncome)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>New Regime Tax</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(result.newRegimeTax)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Taxable income: {formatCurrency(result.newTaxableIncome)}
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Recommendation</CardTitle>
                <CardDescription>{result.explanation}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                Choosing <strong>{result.bestRegime}</strong> currently saves about{" "}
                {formatCurrency(result.savingsDifference)}.
              </div>
              {(result.winnerReasons ?? []).map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/70 bg-white p-4 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Deduction Impact</CardTitle>
              <CardDescription>Which deductions are doing the most work today.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result.deductionImpacts ?? []).map((item) => (
              <div key={item.name} className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.taxImpactEstimate)} impact
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Claimed {formatCurrency(item.amountClaimed)} out of {formatCurrency(item.cap)}.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Mentor Summary</CardTitle>
              <CardDescription>Grounded in the tax result and then optionally refined by AI.</CardDescription>
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
            <CardTitle>Ranked Tax-Saving Suggestions</CardTitle>
            <CardDescription>Ordered by tax impact, then liquidity and risk quality.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.rankedSuggestions.map((item) => (
            <div
              key={item.name}
              className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-[2fr,1fr,1fr,1fr]"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.notes}</p>
              </div>
              <p className="text-sm text-muted-foreground">Risk: {item.risk}</p>
              <p className="text-sm text-muted-foreground">Liquidity: {item.liquidity}</p>
              <p className="text-sm text-muted-foreground">
                Tax benefit: {formatCurrency(item.expectedTaxBenefit)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <AssumptionsPanel
        title="Tax assumptions"
        description="Tax-year rules, confidence, and missing inputs that could change the result."
        assumptions={result.assumptionsUsed}
        confidence={result.confidence}
        sources={result.source ? [result.source] : []}
        missingInputs={result.missedDeductions}
      />
    </div>
  );
}
