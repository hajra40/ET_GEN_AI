import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { GeminiServiceError, generateAISummary } from "@/lib/ai/gemini-service";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON request body." }, { status: 400 });
  }

  const prompt = typeof (body as { prompt?: unknown })?.prompt === "string" ? (body as { prompt: string }).prompt.trim() : "";
  const context = typeof (body as { context?: unknown })?.context === "string" ? (body as { context: string }).context.trim() : "";

  if (!prompt) {
    return NextResponse.json({ success: false, error: "Prompt is required and cannot be empty." }, { status: 400 });
  }

  if (!context) {
    return NextResponse.json({ success: false, error: "Context is required and cannot be empty." }, { status: 400 });
  }

  try {
    const summary = await generateAISummary(prompt, context);

    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected /api/ai-summary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AI summary generation failed unexpectedly."
      },
      { status: 500 }
    );
  }
}
