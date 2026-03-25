import { MoneyHealthPanel } from "@/components/modules/money-health-panel";
import { requireProfile } from "@/lib/auth/guards";
import { calculateMoneyHealthScore } from "@/lib/calculators/money-health";

export default async function MoneyHealthPage() {
  const profile = await requireProfile();
  const result = calculateMoneyHealthScore(profile);

  return <MoneyHealthPanel result={result} />;
}
