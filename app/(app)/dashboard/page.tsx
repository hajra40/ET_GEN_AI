import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireProfile } from "@/lib/auth/guards";
import { buildInsightContext } from "@/lib/data/compose";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const context = await buildInsightContext(profile);

  return <DashboardOverview profile={profile} context={context} />;
}
