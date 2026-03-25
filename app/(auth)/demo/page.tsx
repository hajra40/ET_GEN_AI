import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoProfiles } from "@/lib/data/demo-profiles";

export default function DemoAccountsPage() {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card className="rounded-[32px]">
        <CardHeader>
          <CardTitle className="text-3xl">Demo Accounts</CardTitle>
          <CardDescription>
            All demo accounts use the password <strong>demo123</strong>. Pick any profile and log in from the main sign-in page.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {demoProfiles.map((profile) => (
          <Card key={profile.email}>
            <CardHeader>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {profile.city} • {profile.age} years • {profile.riskAppetite} risk
              </p>
              <p>Monthly income: ₹{profile.monthlyIncome.toLocaleString("en-IN")}</p>
              <p>Focus: {profile.financialGoals[0]?.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button asChild size="lg">
        <Link href="/login">Back to Login</Link>
      </Button>
    </div>
  );
}
