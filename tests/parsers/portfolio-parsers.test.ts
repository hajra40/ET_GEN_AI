import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parsePortfolioCsvText } from "@/lib/parsers/portfolio/parse-csv";
import { parseCasPdf } from "@/lib/parsers/portfolio/parse-cas-pdf";
import { parseCasText } from "@/lib/parsers/portfolio/parse-cas-text";

describe("portfolio parsers", () => {
  it("parses snapshot CSV fixtures", () => {
    const csv = fs.readFileSync(path.resolve("tests/fixtures/portfolio-snapshot.csv"), "utf8");
    const funds = parsePortfolioCsvText(csv);

    expect(funds).toHaveLength(2);
    expect(funds[0]?.topHoldings).toHaveLength(0);
  });

  it("parses transaction CSV fixtures", () => {
    const csv = fs.readFileSync(path.resolve("tests/fixtures/portfolio-transactions.csv"), "utf8");
    const funds = parsePortfolioCsvText(csv);

    expect(funds[0]?.transactions?.length).toBeGreaterThan(0);
  });

  it("parses CAS text and PDF-like fixtures", () => {
    const text = fs.readFileSync(path.resolve("tests/fixtures/cas-sample.txt"), "utf8");
    const pdfLike = fs.readFileSync(path.resolve("tests/fixtures/cas-pdf-like.txt"));

    expect(parseCasText(text).funds.length).toBeGreaterThan(0);
    expect(parseCasPdf(new Uint8Array(pdfLike)).funds.length).toBeGreaterThan(0);
  });
});
