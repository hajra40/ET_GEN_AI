import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/utils";

export default async function SettingsPage() {
  const profile = await requireProfile();

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
            <p>Monthly income: {formatCurrency(profile.monthlyIncome)}</p>
            <p>Monthly expenses: {formatCurrency(profile.monthlyExpenses)}</p>
            <p>Risk appetite: {profile.riskAppetite}</p>
            <p>Preferred tax regime: {profile.taxRegimePreference}</p>
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
            <p>Portfolio statement parsing includes working CSV support and a demo-safe PDF fallback.</p>
            <Button asChild variant="outline">
              <Link href="/onboarding">Update profile inputs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
