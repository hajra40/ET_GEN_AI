import { getDefaultTaxYear, getTaxRules } from "@/lib/config/tax-rules";

export function getIncomeTaxMetadata(taxYear = getDefaultTaxYear()) {
  const rules = getTaxRules(taxYear);

  return {
    taxYear: rules.taxYear,
    sources: rules.sources,
    assumptions: rules.assumptions
  };
}
