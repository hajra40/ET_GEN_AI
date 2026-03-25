import { NextResponse } from "next/server";
import { authSchema } from "@/lib/types";
import { setSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/data/store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = authSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const session = authenticateUser(parsed.data.email, parsed.data.password);
  if (!session) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  setSession(session);
  return NextResponse.json({ success: true, user: session });
}
