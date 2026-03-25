import { NextResponse } from "next/server";
import { calculateCouplePlan } from "@/lib/calculators/couple";
import type { CouplePlannerInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as CouplePlannerInput;
  return NextResponse.json(calculateCouplePlan(body));
}
