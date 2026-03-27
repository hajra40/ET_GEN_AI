import { NextResponse } from "next/server";
import { authSchema } from "@/lib/types";
import { setSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/data/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
    }

    const session = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!session) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    setSession(session);
    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to log in." },
      { status: 500 }
    );
  }
}
