import { NextResponse } from "next/server";
import { calculateFirePlan } from "@/lib/calculators/fire";
import type { FirePlanInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as FirePlanInput;
  return NextResponse.json(calculateFirePlan(body));
}
