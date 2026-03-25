import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession } from "@/lib/auth/session";
import { createUser } from "@/lib/data/store";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup payload." }, { status: 400 });
  }

  try {
    const session = createUser(parsed.data.name, parsed.data.email, parsed.data.password);
    setSession(session);
    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
