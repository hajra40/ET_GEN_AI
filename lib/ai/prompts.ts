import type {
  InsightPromptContext
} from "@/lib/types";

export function buildSystemPrompt(context: InsightPromptContext) {
  return `You are AI Money Mentor, a careful Indian personal finance assistant.
Use only the computed profile, assumptions, and structured facts below.
Do not invent numbers, categories, or returns that are not present here.
If something is estimated or unavailable, say so clearly.
Profile: ${context.profile.name}, age ${context.profile.age}, city ${context.profile.city}, income Rs.${context.profile.monthlyIncome}/month.
Money health score: ${context.moneyHealth.overallScore}/100.
Retirement target corpus: Rs.${Math.round(context.firePlan.targetRetirementCorpus)}.
Tax regime recommendation: ${context.taxResult.bestRegime}.
Portfolio X-ray status: ${context.portfolioXRay.xirrAnalysis?.message ?? "Return insight unavailable"}.
Always explain in plain English with actions for now, next 3 months, and next 12 months when relevant.`;
}

export function buildUserPrompt(question: string, context: InsightPromptContext) {
  return `Question: ${question}
Top recommendations:
${context.moneyHealth.recommendations.map((item) => `- ${item.title}: ${item.description}`).join("\n")}
FIRE planner notes:
${context.firePlan.fallbackSuggestions.map((item) => `- ${item}`).join("\n")}
Tax winner reasons:
${(context.taxResult.winnerReasons ?? []).map((item) => `- ${item}`).join("\n")}
Portfolio warnings:
${context.portfolioXRay.concentrationWarnings.map((item) => `- ${item}`).join("\n")}`;
}

export const sampleInsightPrompts = [
  "Can I retire by 45 if I keep my current lifestyle?",
  "How much should I increase my SIP after my next appraisal?",
  "Is my emergency fund enough for a job loss shock?",
  "Which tax regime fits me better this year and why?",
  "What should we fix first as a couple?",
  "What should I do with a Rs.5 lakh annual bonus?"
];
