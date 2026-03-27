import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { generateInsightAnswer } from "@/lib/ai/insights";
import { generateGeminiInsight } from "@/lib/ai/gemini-service";
import { buildInsightContext } from "@/lib/data/compose";
import { addChatMessage, getChatHistory, getProfileByEmail } from "@/lib/data/store";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { question?: string };
    if (!body.question?.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const profile = await getProfileByEmail(session.email);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const context = await buildInsightContext(profile);
    const answer =
      (await generateGeminiInsight(body.question, context)) ??
      (await generateInsightAnswer(body.question, context));
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

    await addChatMessage(session.email, userMessage);
    await addChatMessage(session.email, assistantMessage);

    return NextResponse.json({ messages: await getChatHistory(session.email) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save insight history." },
      { status: 500 }
    );
  }
}
