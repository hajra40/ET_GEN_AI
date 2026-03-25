import { NextResponse } from "next/server";
import { calculatePortfolioXRay } from "@/lib/calculators/portfolio";
import type { PortfolioFund } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as PortfolioFund[];
  return NextResponse.json(calculatePortfolioXRay(body));
}
