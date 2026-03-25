import { PortfolioXRay } from "@/components/modules/portfolio-xray";
import { requireProfile } from "@/lib/auth/guards";
import { getPortfolioByEmail } from "@/lib/data/store";

export default async function PortfolioXRayPage() {
  const profile = await requireProfile();
  const holdings = getPortfolioByEmail(profile.email);

  return <PortfolioXRay initialFunds={holdings} />;
}
