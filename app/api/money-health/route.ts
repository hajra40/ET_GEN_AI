import { NextResponse } from "next/server";
import { calculateMoneyHealthScore } from "@/lib/calculators/money-health";
import type { UserProfile } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as UserProfile;
  return NextResponse.json(calculateMoneyHealthScore(body));
}
