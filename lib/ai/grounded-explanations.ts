import type {
  CouplePlannerResult,
  FirePlanResult,
  GroundedFactsPacket,
  LifeEventActionPlan,
  MoneyHealthScoreResult,
  PortfolioXRayResult,
  TaxWizardResult
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function buildFireFactsPacket(result: FirePlanResult): GroundedFactsPacket {
  return {
    module: "fire",
    title: "FIRE planner",
    facts: [
      { label: "On track", value: result.onTrack },
      { label: "Target corpus", value: formatCurrency(result.targetRetirementCorpus) },
      { label: "Projected corpus", value: formatCurrency(result.projectedCorpus) },
      { label: "Required retirement SIP", value: formatCurrency(result.monthlySipRequired) },
      {
        label: "Retirement allocation in current waterfall",
        value: formatCurrency(result.goalFundingPlan?.retirementMonthlyAllocation ?? 0)
      }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: result.fallbackSuggestions,
    confidence: result.confidence
  };
}

export function buildMoneyHealthFactsPacket(result: MoneyHealthScoreResult): GroundedFactsPacket {
  return {
    module: "money-health",
    title: "Money health",
    facts: [
      { label: "Overall score", value: `${result.overallScore}/100` },
      {
        label: "Weakest dimension",
        value: result.dimensions.slice().sort((a, b) => a.score - b.score)[0]?.label ?? "N/A"
      },
      {
        label: "Top action",
        value: result.recommendations[0]?.title ?? "Review weakest score driver"
      }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: result.missingDataThatCouldChangeThis ?? [],
    confidence: result.confidence
  };
}

export function buildTaxFactsPacket(result: TaxWizardResult): GroundedFactsPacket {
  return {
    module: "tax",
    title: "Tax wizard",
    facts: [
      { label: "Tax year", value: result.taxYear ?? "Current tax year" },
      { label: "Best regime", value: result.bestRegime.toUpperCase() },
      { label: "Tax difference", value: formatCurrency(result.savingsDifference) },
      { label: "Old regime tax", value: formatCurrency(result.oldRegimeTax) },
      { label: "New regime tax", value: formatCurrency(result.newRegimeTax) }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: [...result.missedDeductions, ...(result.winnerReasons ?? [])],
    confidence: result.confidence
  };
}

export function buildPortfolioFactsPacket(result: PortfolioXRayResult): GroundedFactsPacket {
  return {
    module: "portfolio",
    title: "Portfolio X-Ray",
    facts: [
      { label: "Funds analysed", value: result.reconstructedHoldings.length },
      {
        label: "XIRR status",
        value: result.xirrAnalysis?.message ?? "Return insight unavailable"
      },
      {
        label: "Expense drag",
        value: formatCurrency(result.expenseRatioDragEstimate)
      },
      {
        label: "Benchmark comparison",
        value:
          result.benchmarkComparison.portfolioReturn != null &&
          result.benchmarkComparison.benchmarkReturn != null
            ? `${result.benchmarkComparison.portfolioReturn}% vs ${result.benchmarkComparison.benchmarkReturn}%`
            : "Benchmark comparison unavailable"
      }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: [...result.concentrationWarnings, ...result.rebalancingSuggestions],
    confidence: result.confidence
  };
}

export function buildCoupleFactsPacket(result: CouplePlannerResult): GroundedFactsPacket {
  return {
    module: "couple",
    title: "Couple planner",
    facts: [
      { label: "Combined income", value: formatCurrency(result.combinedIncome) },
      { label: "Combined surplus", value: formatCurrency(result.combinedSurplus ?? 0) },
      {
        label: "Suggested SIP split",
        value: `A ${formatCurrency(result.optimizedSipSplit.partnerA)} / B ${formatCurrency(result.optimizedSipSplit.partnerB)}`
      }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: [...result.highLevelSuggestions, ...result.insuranceSplitRecommendations],
    confidence: result.confidence
  };
}

export function buildLifeEventFactsPacket(result: LifeEventActionPlan): GroundedFactsPacket {
  return {
    module: "life-events",
    title: "Life event plan",
    facts: [
      { label: "Emergency fund note", value: result.emergencyFundChange },
      { label: "Allocation update", value: result.allocationUpdate },
      { label: "Insurance and tax note", value: result.insuranceAndTaxNote }
    ],
    assumptions: result.assumptionsUsed ?? [],
    riskNotes: [...result.now, ...result.in3Months],
    confidence: result.confidence
  };
}

export function buildGroundedSummary(packet: GroundedFactsPacket) {
  const factLines = packet.facts
    .map((fact) => `${fact.label}: ${String(fact.value)}`)
    .join(". ");
  const actionLine = packet.riskNotes[0] ?? "Review the weakest area and update any missing inputs.";

  return `${packet.title}: ${factLines}. Next best move: ${actionLine}`;
}
