import type {
  InsightPromptContext
} from "@/lib/types";
import {
  buildCoupleFactsPacket,
  buildFireFactsPacket,
  buildGroundedSummary,
  buildMoneyHealthFactsPacket,
  buildPortfolioFactsPacket,
  buildTaxFactsPacket
} from "@/lib/ai/grounded-explanations";
import { formatCurrency } from "@/lib/utils";

function answerRetirement(context: InsightPromptContext) {
  return buildGroundedSummary(buildFireFactsPacket(context.firePlan));
}

function answerEmergencyFund(context: InsightPromptContext) {
  const emergency = context.profile.emergencyFund;
  const target = context.firePlan.emergencyFundTarget;
  return `Your current emergency fund is ${formatCurrency(emergency)} versus a suggested target of ${formatCurrency(target)}. ${context.moneyHealth.dimensions.find((dimension) => dimension.key === "emergency_preparedness")?.topAction ?? "Keep building liquidity before increasing long-term risk."}`;
}

function answerTax(context: InsightPromptContext) {
  return buildGroundedSummary(buildTaxFactsPacket(context.taxResult));
}

function answerSip(context: InsightPromptContext) {
  const retirementNeed = context.firePlan.goalFundingPlan?.retirementMonthlyAllocation ?? 0;
  return `A useful target is ${formatCurrency(context.firePlan.monthlySipRequired)} per month for retirement, but the current waterfall is allocating ${formatCurrency(retirementNeed)} after urgent goals and protection needs. ${context.firePlan.whatToDoNow?.[3] ?? "Increase retirement investing when surplus opens up."}`;
}

function answerPortfolio(context: InsightPromptContext) {
  return buildGroundedSummary(buildPortfolioFactsPacket(context.portfolioXRay));
}

function answerCouple(context: InsightPromptContext) {
  return buildGroundedSummary(
    buildCoupleFactsPacket({
      combinedIncome: context.profile.monthlyIncome,
      combinedExpenses: context.profile.monthlyExpenses + context.profile.loanEmi,
      combinedNetWorth: context.profile.currentSavings,
      combinedSurplus: context.profile.monthlyIncome - context.profile.monthlyExpenses - context.profile.loanEmi,
      jointEmergencyFundTarget: context.firePlan.emergencyFundTarget,
      optimizedSipSplit: {
        partnerA: context.firePlan.goalFundingPlan?.retirementMonthlyAllocation ?? 0,
        partnerB: 0
      },
      highLevelSuggestions: context.moneyHealth.recommendations.map((item) => item.title),
      insuranceSplitRecommendations: context.firePlan.insuranceGapSuggestions,
      soloVsJointDelta: {
        soloEmergencyFunds: context.firePlan.emergencyFundTarget,
        jointEmergencyFund: context.firePlan.emergencyFundTarget,
        monthlySurplusIncrease: 0
      }
    })
  );
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

  if (normalizedQuestion.includes("couple") || normalizedQuestion.includes("partner")) {
    return answerCouple(context);
  }

  if (normalizedQuestion.includes("bonus")) {
    return "Protect liquidity first, clear expensive debt second, and only then deploy the rest into high-priority goals and retirement. The exact split depends on whether your emergency fund and insurance gaps are already closed.";
  }

  return buildGroundedSummary(buildMoneyHealthFactsPacket(context.moneyHealth));
}
