import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { generateAISummary } from "@/lib/ai/gemini-service";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { prompt?: string; context?: string };
  if (!body.prompt?.trim() || !body.context?.trim()) {
    return NextResponse.json({ error: "Prompt and context are required." }, { status: 400 });
  }

  const summary = await generateAISummary(body.prompt, body.context);
  return NextResponse.json({ summary });
}
