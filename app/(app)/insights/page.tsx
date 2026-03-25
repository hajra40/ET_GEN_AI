import { InsightsChat } from "@/components/modules/insights-chat";
import { requireProfile } from "@/lib/auth/guards";
import { getChatHistory } from "@/lib/data/store";

export default async function InsightsPage() {
  const profile = await requireProfile();
  const messages = getChatHistory(profile.email);

  return <InsightsChat initialMessages={messages} />;
}
