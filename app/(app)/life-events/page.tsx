import { LifeEventAdvisor } from "@/components/modules/life-event-advisor";
import { requireProfile } from "@/lib/auth/guards";

export default async function LifeEventPage() {
  const profile = await requireProfile();

  return <LifeEventAdvisor profile={profile} />;
}
