import { NextResponse } from "next/server";
import { compareTaxRegimes } from "@/lib/calculators/tax";
import type { TaxWizardInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as TaxWizardInput;
  return NextResponse.json(compareTaxRegimes(body));
}
