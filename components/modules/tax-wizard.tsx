"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import type { TaxWizardInput, UserProfile } from "@/lib/types";
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
    cityType: ["mumbai", "delhi", "kolkata", "chennai", "bengaluru", "bangalore"].includes(profile.city.toLowerCase())
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
    otherDeductions: profile.salaryBreakdown.otherDeductions
  });
  const [uploadMessage, setUploadMessage] = useState("");
  const result = compareTaxRegimes(form);

  async function uploadForm16(file: File) {
    const formData = new FormData();
    formData.append("kind", "form16");
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as { extracted?: TaxWizardInput; message?: string };
    if (data.extracted) {
      setForm(data.extracted);
    }
    setUploadMessage(data.message ?? "Sample Form 16 extraction loaded.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tax Wizard"
        title={`Best regime right now: ${result.bestRegime.toUpperCase()}`}
        description="Compare old and new tax regimes for salaried Indian users with rules-based calculations, deduction analysis, and ranked tax-saving ideas."
        badge="AY 2026-27 slab logic"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Salary Inputs</CardTitle>
              <CardDescription>Manual entry or sample Form 16 upload.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Form 16
            </Button>
            <input
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
              ["annualGrossSalary", "Annual gross salary"],
              ["basicSalary", "Basic salary"],
              ["hraReceived", "HRA received"],
              ["annualRentPaid", "Annual rent paid"],
              ["bonus", "Bonus"],
              ["professionalTax", "Professional tax"],
              ["section80c", "Section 80C"],
              ["section80d", "Section 80D"],
              ["npsEmployee", "NPS employee"],
              ["npsEmployer", "NPS employer"],
              ["homeLoanInterest", "Home loan interest"],
              ["otherDeductions", "Other deductions"]
            ].map(([key, label]) => (
              <Input
                key={key}
                type="number"
                value={form[key as keyof TaxWizardInput] as number}
                onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
                placeholder={label}
              />
            ))}
            <Select
              value={form.cityType}
              onChange={(event) => setForm((current) => ({ ...current, cityType: event.target.value as TaxWizardInput["cityType"] }))}
            >
              <option value="metro">Metro city</option>
              <option value="non_metro">Non-metro city</option>
            </Select>
            {uploadMessage ? <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">{uploadMessage}</p> : null}
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
                Choosing <strong>{result.bestRegime}</strong> currently saves about {formatCurrency(result.savingsDifference)}.
              </div>
              <div className="space-y-2">
                {result.missedDeductions.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-white p-4 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ranked Tax-Saving Suggestions</CardTitle>
            <CardDescription>Ordered by expected benefit based on the current profile.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.rankedSuggestions.map((item) => (
            <div key={item.name} className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-[2fr,1fr,1fr,1fr]">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.notes}</p>
              </div>
              <p className="text-sm text-muted-foreground">Risk: {item.risk}</p>
              <p className="text-sm text-muted-foreground">Liquidity: {item.liquidity}</p>
              <p className="text-sm text-muted-foreground">Tax benefit: {formatCurrency(item.expectedTaxBenefit)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
