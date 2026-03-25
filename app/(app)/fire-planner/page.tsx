import { FirePlanner } from "@/components/modules/fire-planner";
import { requireProfile } from "@/lib/auth/guards";

export default async function FirePlannerPage() {
  const profile = await requireProfile();

  return <FirePlanner profile={profile} />;
}
