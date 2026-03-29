import type {
  PortfolioTransaction,
  PortfolioXirrAnalysis
} from "@/lib/types";
import { round } from "@/lib/utils";

interface CashFlow {
  date: Date;
  amount: number;
}

function daysBetween(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function npv(rate: number, cashFlows: CashFlow[]) {
  const firstDate = cashFlows[0]?.date;
  if (!firstDate) {
    return 0;
  }

  return cashFlows.reduce((total, flow) => {
    const years = daysBetween(firstDate, flow.date) / 365;
    return total + flow.amount / (1 + rate) ** years;
  }, 0);
}

function derivative(rate: number, cashFlows: CashFlow[]) {
  const firstDate = cashFlows[0]?.date;
  if (!firstDate) {
    return 0;
  }

  return cashFlows.reduce((total, flow) => {
    const years = daysBetween(firstDate, flow.date) / 365;
    if (years === 0) {
      return total;
    }

    return total - (years * flow.amount) / (1 + rate) ** (years + 1);
  }, 0);
}

function toCashFlows(
  transactions: PortfolioTransaction[],
  currentValue: number,
  valuationDate?: string
) {
  const flows: CashFlow[] = transactions
    .map((transaction) => {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      const direction =
        transaction.type === "buy" || transaction.type === "sip" || transaction.type === "switch_in"
          ? -1
          : 1;

      return {
        date,
        amount: Math.abs(transaction.amount) * direction
      };
    })
    .filter((flow): flow is CashFlow => flow !== null)
    .sort((left, right) => left.date.getTime() - right.date.getTime());

  if (currentValue > 0) {
    flows.push({
      date: valuationDate ? new Date(valuationDate) : new Date(),
      amount: currentValue
    });
  }

  return flows;
}

export function calculateXirrFromTransactions(
  transactions: PortfolioTransaction[],
  currentValue: number,
  valuationDate?: string
): PortfolioXirrAnalysis {
  if (!transactions.length) {
    return {
      value: null,
      status: "unavailable",
      message: "XIRR unavailable from snapshot-only data."
    };
  }

  const cashFlows = toCashFlows(transactions, currentValue, valuationDate);
  const hasOutflow = cashFlows.some((flow) => flow.amount < 0);
  const hasInflow = cashFlows.some((flow) => flow.amount > 0);

  if (!hasOutflow || !hasInflow) {
    return {
      value: null,
      status: "unavailable",
      message: "XIRR needs both investment cash flows and a current valuation."
    };
  }

  let rate = 0.12;
  for (let index = 0; index < 100; index += 1) {
    const value = npv(rate, cashFlows);
    if (Math.abs(value) < 0.0001) {
      return {
        value: round(rate * 100, 2),
        status: "exact",
        message: "XIRR calculated from dated cash flows and current valuation."
      };
    }

    const slope = derivative(rate, cashFlows);
    if (Math.abs(slope) < 0.0000001) {
      break;
    }

    rate -= value / slope;
    if (!Number.isFinite(rate) || rate <= -0.9999) {
      break;
    }
  }

  return {
    value: null,
    status: "unavailable",
    message: "XIRR could not be solved reliably from the available cash flows."
  };
}
