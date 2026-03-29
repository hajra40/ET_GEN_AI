import type {
  PortfolioFund,
  PortfolioOverlapItem
} from "@/lib/types";
import { round } from "@/lib/utils";

function computeExactOverlap(left: PortfolioFund, right: PortfolioFund) {
  const leftMap = new Map(left.topHoldings.map((holding) => [holding.name.toLowerCase(), holding.weight]));
  const rightMap = new Map(right.topHoldings.map((holding) => [holding.name.toLowerCase(), holding.weight]));
  let overlap = 0;

  leftMap.forEach((weight, name) => {
    const counterpart = rightMap.get(name);
    if (counterpart) {
      overlap += Math.min(weight, counterpart);
    }
  });

  return overlap;
}

function computeEstimatedOverlap(left: PortfolioFund, right: PortfolioFund) {
  const sharedStyles = left.styleTags.filter((tag) => right.styleTags.includes(tag)).length;
  const sameCategory = left.category.trim().toLowerCase() === right.category.trim().toLowerCase();

  if (!sameCategory && sharedStyles === 0) {
    return null;
  }

  return Math.min(35, (sameCategory ? 16 : 0) + sharedStyles * 6);
}

export function calculateFundOverlap(funds: PortfolioFund[]): PortfolioOverlapItem[] {
  const overlapItems: PortfolioOverlapItem[] = [];

  for (let leftIndex = 0; leftIndex < funds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < funds.length; rightIndex += 1) {
      const left = funds[leftIndex];
      const right = funds[rightIndex];

      if (left.topHoldings.length > 0 && right.topHoldings.length > 0) {
        const overlap = computeExactOverlap(left, right);
        if (overlap > 0) {
          overlapItems.push({
            pair: `${left.fundName} + ${right.fundName}`,
            overlapPercent: round(overlap, 1),
            status: "exact",
            basis: "Computed from overlapping underlying holdings."
          });
        }
        continue;
      }

      const estimated = computeEstimatedOverlap(left, right);
      overlapItems.push({
        pair: `${left.fundName} + ${right.fundName}`,
        overlapPercent: estimated == null ? null : round(estimated, 1),
        status: estimated == null ? "unavailable" : "estimated",
        basis:
          estimated == null
            ? "Actual holdings unavailable for one or both funds."
            : "Estimated from shared category and style tags."
      });
    }
  }

  return overlapItems.sort((left, right) => (right.overlapPercent ?? -1) - (left.overlapPercent ?? -1));
}
