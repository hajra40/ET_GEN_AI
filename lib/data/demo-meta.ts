import type {
  ChatMessage,
  LifeEventType
} from "@/lib/types";

function isoDate() {
  return new Date().toISOString();
}

export const demoChatHistory: Record<string, ChatMessage[]> = {
  "aanya@demo.in": [
    {
      id: "chat-1",
      role: "assistant",
      content: "Your biggest unlock is to raise emergency reserves and then step up your retirement SIP after your next appraisal.",
      createdAt: isoDate()
    }
  ]
};

export const demoLifeEventOptions: { label: string; value: LifeEventType }[] = [
  { label: "Annual Bonus", value: "annual_bonus" },
  { label: "Marriage", value: "marriage" },
  { label: "New Baby", value: "new_baby" },
  { label: "Inheritance", value: "inheritance" },
  { label: "Job Loss", value: "job_loss" },
  { label: "Home Purchase", value: "home_purchase" }
];
