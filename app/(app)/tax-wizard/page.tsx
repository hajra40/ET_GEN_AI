import { TaxWizard } from "@/components/modules/tax-wizard";
import { requireProfile } from "@/lib/auth/guards";

export default async function TaxWizardPage() {
  const profile = await requireProfile();

  return <TaxWizard profile={profile} />;
}
