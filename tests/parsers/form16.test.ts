import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assessForm16Confidence } from "@/lib/parsers/form16/confidence";
import { mapForm16ToTaxInput } from "@/lib/parsers/form16/map-to-tax-input";
import { parseForm16Text } from "@/lib/parsers/form16/parse-form16";

describe("Form 16 parsers", () => {
  it("extracts common salary fields from fixture text", () => {
    const text = fs.readFileSync(path.resolve("tests/fixtures/form16-sample.txt"), "utf8");
    const parsed = parseForm16Text(text);
    const confidence = assessForm16Confidence(parsed);
    const mapped = mapForm16ToTaxInput(parsed);

    expect(parsed.annualGrossSalary).toBe(1800000);
    expect(parsed.basicSalary).toBe(720000);
    expect(confidence.score).toBeGreaterThanOrEqual(45);
    expect(mapped.annualGrossSalary).toBe(1800000);
  });
});
