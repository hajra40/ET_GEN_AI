function parseAmount(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  const sanitized = raw.replace(/[, ]/g, "");
  const value = Number(sanitized);
  return Number.isFinite(value) ? value : null;
}

function findAmount(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = parseAmount(match?.[1]);
    if (value != null) {
      return value;
    }
  }

  return null;
}

export interface ParsedForm16Data {
  annualGrossSalary: number | null;
  basicSalary: number | null;
  hraReceived: number | null;
  bonus: number | null;
  employerPf: number | null;
  professionalTax: number | null;
  section80c: number | null;
  section80d: number | null;
  npsEmployee: number | null;
  npsEmployer: number | null;
  tds: number | null;
}

export function parseForm16Text(text: string): ParsedForm16Data {
  const normalized = text.replace(/\s+/g, " ");

  return {
    annualGrossSalary: findAmount(normalized, [
      /gross salary[^0-9]{0,30}([0-9,]+(?:\.\d+)?)/i,
      /gross total salary[^0-9]{0,30}([0-9,]+(?:\.\d+)?)/i,
      /salary as per provisions contained in section 17\(1\)[^0-9]{0,30}([0-9,]+(?:\.\d+)?)/i,
      /income chargeable under the head salaries[^0-9]{0,30}([0-9,]+(?:\.\d+)?)/i
    ]),
    basicSalary: findAmount(normalized, [
      /basic salary[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i,
      /salary[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ]),
    hraReceived: findAmount(normalized, [
      /house rent allowance[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i,
      /\bhra\b[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ]),
    bonus: findAmount(normalized, [
      /bonus[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i,
      /performance bonus[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ]),
    employerPf: findAmount(normalized, [
      /employer provident fund[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i,
      /employer pf[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ]),
    professionalTax: findAmount(normalized, [
      /professional tax[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ]),
    section80c: findAmount(normalized, [
      /80c[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i,
      /section 80c[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i
    ]),
    section80d: findAmount(normalized, [
      /80d[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i,
      /section 80d[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i
    ]),
    npsEmployee: findAmount(normalized, [
      /80ccd\(1b\)[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i,
      /employee contribution[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i
    ]),
    npsEmployer: findAmount(normalized, [
      /80ccd\(2\)[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i,
      /employer contribution to nps[^0-9]{0,20}([0-9,]+(?:\.\d+)?)/i
    ]),
    tds: findAmount(normalized, [
      /tax deducted[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i,
      /\btds\b[^0-9]{0,25}([0-9,]+(?:\.\d+)?)/i
    ])
  };
}
