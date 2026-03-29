import type {
  PortfolioFund,
  PortfolioTransaction
} from "@/lib/types";

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findColumn(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

function toNumber(value: string | undefined, fallback = 0) {
  const parsed = Number((value ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parsePortfolioCsvText(csvText: string): PortfolioFund[] {
  const rows = csvText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return [];
  }

  const headers = splitCsvLine(rows[0]).map(normalizeHeader);
  const fundIndex = findColumn(headers, ["fundname", "fund", "scheme", "schemename", "schemename"]);
  const categoryIndex = findColumn(headers, ["category", "assetclass", "fundcategory"]);
  const investedIndex = findColumn(headers, ["investedamount", "costvalue", "invested", "purchasevalue"]);
  const currentValueIndex = findColumn(headers, ["currentvalue", "marketvalue", "value", "currentmarketvalue"]);
  const expenseIndex = findColumn(headers, ["expenseratio", "expense", "expenseratiopercent"]);
  const benchmarkIndex = findColumn(headers, ["benchmarkreturn", "benchmark"]);
  const annualizedIndex = findColumn(headers, ["annualizedreturn", "xirr", "irr", "return"]);
  const schemeCodeIndex = findColumn(headers, ["schemecode", "amficode", "schemeid"]);
  const navIndex = findColumn(headers, ["nav"]);
  const navDateIndex = findColumn(headers, ["navdate", "valuationdate"]);
  const styleIndex = findColumn(headers, ["styletags", "styles", "tags"]);
  const dateIndex = findColumn(headers, ["date", "transactiondate"]);
  const amountIndex = findColumn(headers, ["amount", "transactionamount"]);
  const typeIndex = findColumn(headers, ["type", "transactiontype"]);

  const aggregated = new Map<string, PortfolioFund>();

  rows.slice(1).forEach((row) => {
    const cells = splitCsvLine(row);
    const fundName = cells[fundIndex] ?? "Imported Fund";
    const existing = aggregated.get(fundName) ?? {
      fundName,
      category: cells[categoryIndex] ?? "Unclassified",
      investedAmount: 0,
      currentValue: 0,
      expenseRatio: toNumber(cells[expenseIndex], 0),
      benchmarkReturn: toNumber(cells[benchmarkIndex], 0),
      annualizedReturn: toNumber(cells[annualizedIndex], 0),
      styleTags: (cells[styleIndex] ?? "")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean),
      topHoldings: [],
      schemeCode: cells[schemeCodeIndex] ?? undefined,
      nav: navIndex >= 0 ? toNumber(cells[navIndex], 0) : undefined,
      navDate: cells[navDateIndex] ?? undefined,
      transactions: []
    };

    existing.investedAmount += toNumber(cells[investedIndex], 0);
    existing.currentValue = Math.max(existing.currentValue, toNumber(cells[currentValueIndex], 0));

    if (dateIndex >= 0 && amountIndex >= 0) {
      const transaction: PortfolioTransaction = {
        date: cells[dateIndex] ?? new Date().toISOString(),
        amount: toNumber(cells[amountIndex], 0),
        type:
          (cells[typeIndex]?.toLowerCase().replace(/\s+/g, "_") as PortfolioTransaction["type"]) ??
          "buy"
      };
      existing.transactions = [...(existing.transactions ?? []), transaction];
    }

    aggregated.set(fundName, existing);
  });

  return Array.from(aggregated.values());
}
