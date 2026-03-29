import { describe, expect, it } from "vitest";
import { compareTaxRegimes } from "@/lib/calculators/tax";

describe("compareTaxRegimes", () => {
  it("prefers the old regime when deductions and HRA are strong", () => {
    const result = compareTaxRegimes({
      annualGrossSalary: 1800000,
      basicSalary: 720000,
      hraReceived: 300000,
      annualRentPaid: 420000,
      cityType: "metro",
      bonus: 100000,
      employerPf: 86400,
      professionalTax: 2400,
      section80c: 150000,
      section80d: 25000,
      npsEmployee: 50000,
      npsEmployer: 30000,
      homeLoanInterest: 200000,
      otherDeductions: 25000,
      taxYear: "AY2025-26"
    });

    expect(result.bestRegime).toBe("old");
    expect(result.winnerReasons?.length).toBeGreaterThan(0);
  });

  it("prefers the new regime when deductions are low", () => {
    const result = compareTaxRegimes({
      annualGrossSalary: 1600000,
      basicSalary: 640000,
      hraReceived: 0,
      annualRentPaid: 0,
      cityType: "non_metro",
      bonus: 0,
      employerPf: 0,
      professionalTax: 0,
      section80c: 10000,
      section80d: 0,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0,
      taxYear: "AY2026-27"
    });

    expect(result.bestRegime).toBe("new");
    expect(result.taxYear).toBe("AY2026-27");
  });

  it("changes new-regime outcomes across tax years", () => {
    const ay2025 = compareTaxRegimes({
      annualGrossSalary: 1200000,
      basicSalary: 480000,
      hraReceived: 0,
      annualRentPaid: 0,
      cityType: "non_metro",
      bonus: 0,
      employerPf: 0,
      professionalTax: 0,
      section80c: 0,
      section80d: 0,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0,
      taxYear: "AY2025-26"
    });
    const ay2026 = compareTaxRegimes({
      annualGrossSalary: 1200000,
      basicSalary: 480000,
      hraReceived: 0,
      annualRentPaid: 0,
      cityType: "non_metro",
      bonus: 0,
      employerPf: 0,
      professionalTax: 0,
      section80c: 0,
      section80d: 0,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0,
      taxYear: "AY2026-27"
    });

    expect(ay2026.newRegimeTax).toBeLessThanOrEqual(ay2025.newRegimeTax);
  });
});
