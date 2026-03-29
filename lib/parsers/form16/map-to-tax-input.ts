import type { TaxWizardInput } from "@/lib/types";
import type { ParsedForm16Data } from "@/lib/parsers/form16/parse-form16";

export function mapForm16ToTaxInput(parsed: ParsedForm16Data): TaxWizardInput {
  return {
    annualGrossSalary: parsed.annualGrossSalary ?? 0,
    basicSalary: parsed.basicSalary ?? 0,
    hraReceived: parsed.hraReceived ?? 0,
    annualRentPaid: 0,
    cityType: "non_metro",
    bonus: parsed.bonus ?? 0,
    employerPf: parsed.employerPf ?? 0,
    professionalTax: parsed.professionalTax ?? 0,
    section80c: parsed.section80c ?? 0,
    section80d: parsed.section80d ?? 0,
    npsEmployee: parsed.npsEmployee ?? 0,
    npsEmployer: parsed.npsEmployer ?? 0,
    homeLoanInterest: 0,
    otherDeductions: 0,
    dataQuality: "estimated",
    sourceLabel: "Extracted from uploaded Form 16"
  };
}
