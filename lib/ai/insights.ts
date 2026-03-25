import type {
  InsightPromptContext
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function answerRetirement(context: InsightPromptContext) {
  return context.firePlan.onTrack
    ? `Based on the current assumptions, you are broadly on track. Your projected corpus is ${formatCurrency(context.firePlan.projectedCorpus)} against a target of ${formatCurrency(context.firePlan.targetRetirementCorpus)}. Keep your SIP discipline and step up contributions when income rises.`
    : `On the current path, you are short of the estimated retirement corpus. The target is ${formatCurrency(context.firePlan.targetRetirementCorpus)} while your projected corpus is ${formatCurrency(context.firePlan.projectedCorpus)}. The cleanest fix is to move toward a SIP of about ${formatCurrency(context.firePlan.monthlySipRequired)} per month or push the retirement age out slightly.`;
}

function answerEmergencyFund(context: InsightPromptContext) {
  const emergency = context.profile.emergencyFund;
  const target = context.firePlan.emergencyFundTarget;
  return `Your current emergency fund is ${formatCurrency(emergency)} versus a suggested target of ${formatCurrency(target)}. If income becomes uncertain, prioritize filling this gap before increasing long-duration risk.`;
}

function answerTax(context: InsightPromptContext) {
  return `The ${context.taxResult.bestRegime} regime currently looks better for you. The estimated difference is around ${formatCurrency(context.taxResult.savingsDifference)}. The main reasons are your current deduction usage and the rebate/slab structure that applies to your taxable income.`;
}

function answerSip(context: InsightPromptContext) {
  return `A useful benchmark is to build toward a monthly SIP of ${formatCurrency(context.firePlan.monthlySipRequired)} for your retirement track. If that feels steep, start by stepping up 10% now and redirect every bonus or appraisal into long-term investing.`;
}

function answerPortfolio(context: InsightPromptContext) {
  const strongestWarning = context.portfolioXRay.concentrationWarnings[0];
  return strongestWarning
    ? `Your portfolio’s biggest watchout is this: ${strongestWarning} The approximate annualized return is ${context.portfolioXRay.xirrApproximation}%, and you should reduce overlap before adding more funds.`
    : `Your portfolio looks fairly balanced at a high level. The approximate annualized return is ${context.portfolioXRay.xirrApproximation}%, and the next improvement is to keep expenses low while avoiding duplicate fund exposure.`;
}

export async function generateInsightAnswer(question: string, context: InsightPromptContext) {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes("retire")) {
    return answerRetirement(context);
  }

  if (normalizedQuestion.includes("sip")) {
    return answerSip(context);
  }

  if (normalizedQuestion.includes("emergency")) {
    return answerEmergencyFund(context);
  }

  if (normalizedQuestion.includes("tax") || normalizedQuestion.includes("regime")) {
    return answerTax(context);
  }

  if (normalizedQuestion.includes("portfolio") || normalizedQuestion.includes("fund")) {
    return answerPortfolio(context);
  }

  if (normalizedQuestion.includes("bonus")) {
    return "If you receive a large bonus, first protect liquidity, then clear expensive debt, and only then deploy the rest into long-term goals. A practical split is 20% to emergency cash, 20% to debt reduction if needed, and the rest toward goal-based investing.";
  }

  return `Your strongest next move is to focus on ${context.moneyHealth.recommendations[0]?.title.toLowerCase() ?? "cash-flow discipline"}. Today your money health score is ${context.moneyHealth.overallScore}/100, your preferred retirement path needs about ${formatCurrency(context.firePlan.monthlySipRequired)} per month, and the ${context.taxResult.bestRegime} regime currently looks more efficient.`;
}
