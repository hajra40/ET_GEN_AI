import { NextResponse } from "next/server";
import { buildLifeEventPlan } from "@/lib/calculators/life-events";
import { getServerSession } from "@/lib/auth/session";
import { getProfileByEmail } from "@/lib/data/store";
import type { LifeEventInput } from "@/lib/types";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = getProfileByEmail(session.email);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const body = (await request.json()) as LifeEventInput;
  return NextResponse.json(buildLifeEventPlan(profile, body));
}
