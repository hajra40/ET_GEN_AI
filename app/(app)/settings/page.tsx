import Link from "next/link";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/utils";
import { getAssumptionsForModule } from "@/lib/config/finance-assumptions";
import { getIncomeTaxMetadata } from "@/lib/services/income-tax-metadata";

export default async function SettingsPage() {
  const profile = await requireProfile();
  const taxMetadata = getIncomeTaxMetadata();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile, demo mode, and disclaimers"
        description="Manage the currently logged-in local account and understand the assumptions behind the product."
        badge="Hackathon-ready"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Profile Snapshot</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Name: {profile.name}</p>
            <p>City: {profile.city}</p>
            <p>City type: {profile.cityType ?? "Not set explicitly"}</p>
            <p>Dependents: {profile.dependents}</p>
            <p>Monthly income: {formatCurrency(profile.monthlyIncome)}</p>
            <p>Monthly expenses: {formatCurrency(profile.monthlyExpenses)}</p>
            <p>Emergency fund: {formatCurrency(profile.emergencyFund)}</p>
            <p>Risk appetite: {profile.riskAppetite}</p>
            <p>Preferred tax regime: {profile.taxRegimePreference}</p>
            <p>Goals captured: {profile.financialGoals.length}</p>
            <p>Uploaded data status: {profile.uploadedDataStatus ? "Available for some modules" : "Using profile defaults / demo inputs"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Important Disclaimer</CardTitle>
              <CardDescription>Suitable for demos, education, and decision support.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>All outputs are projections or estimates based on the assumptions visible in the app.</p>
            <p>The product does not guarantee returns, tax outcomes, or financial suitability for every user.</p>
            <p>Tax logic is implemented for typical salaried scenarios and should be reviewed for complex cases.</p>
            <p>Uploads now attempt real parsing first, then fall back to clearly labeled estimated or demo-safe modes.</p>
            <p>Portfolio X-Ray shows exact, estimated, unavailable, or demo states instead of silently faking precision.</p>
            <Button asChild variant="outline">
              <Link href="/onboarding">Update profile inputs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <AssumptionsPanel
        title="Global assumptions"
        description="Core planner defaults and official tax metadata visible from settings."
        assumptions={[...getAssumptionsForModule("fire"), ...getAssumptionsForModule("money-health"), ...taxMetadata.assumptions].filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)}
        confidence={{
          label: "estimated",
          score: 80,
          explanation: "Core planners are deterministic, but future projections still depend on explicit assumptions.",
          lastUpdated: new Date().toISOString()
        }}
        sources={taxMetadata.sources}
        missingInputs={[
          "Exact rent, liabilities, employer benefits, and statement-level transactions improve module accuracy.",
          "Profile-level defaults remain the fallback when uploaded data is unavailable."
        ]}
      />
    </div>
  );
}
