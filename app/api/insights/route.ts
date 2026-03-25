import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { generateInsightAnswer } from "@/lib/ai/insights";
import { buildInsightContext } from "@/lib/data/compose";
import { addChatMessage, getChatHistory, getProfileByEmail } from "@/lib/data/store";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { question?: string };
  if (!body.question?.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const profile = getProfileByEmail(session.email);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const context = buildInsightContext(profile);
  const answer = await generateInsightAnswer(body.question, context);
  const userMessage = {
    id: `user-${Date.now()}`,
    role: "user" as const,
    content: body.question,
    createdAt: new Date().toISOString()
  };
  const assistantMessage = {
    id: `assistant-${Date.now() + 1}`,
    role: "assistant" as const,
    content: answer,
    createdAt: new Date().toISOString()
  };

  addChatMessage(session.email, userMessage);
  addChatMessage(session.email, assistantMessage);

  return NextResponse.json({ messages: getChatHistory(session.email) });
}
