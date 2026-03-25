import { OnboardingWizard } from "@/components/forms/onboarding-wizard";
import { requireProfile } from "@/lib/auth/guards";

export default async function OnboardingPage() {
  const profile = await requireProfile();

  return <OnboardingWizard profile={profile} />;
}
