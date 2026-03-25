import { CouplePlanner } from "@/components/modules/couple-planner";
import { requireProfile } from "@/lib/auth/guards";
import { getAllProfiles } from "@/lib/data/store";

export default async function CouplePlannerPage() {
  const profile = await requireProfile();
  const profiles = getAllProfiles();

  return <CouplePlanner currentProfile={profile} profiles={profiles} />;
}
