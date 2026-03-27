import "server-only";

import type { InsightPromptContext } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 350
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  return text || null;
}

export async function generateAISummary(prompt: string, context: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "AI summary unavailable. Add GEMINI_API_KEY to enable Gemini-powered insights.";
  }

  try {
    const fullPrompt = `You are AI Money Mentor, a careful Indian personal finance mentor.
Give concise, practical advice in simple language.
Do not promise guaranteed returns.
Keep the answer under 150 words.
Use rupee amounts where relevant.

Task:
${prompt}

Context:
${context}`;

    return (await callGemini(fullPrompt)) ?? "AI summary temporarily unavailable. Please try again later.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "AI summary temporarily unavailable. Please try again later.";
  }
}

export async function generateGeminiInsight(question: string, context: InsightPromptContext) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const prompt = `${buildSystemPrompt(context)}

${buildUserPrompt(question, context)}

Answer the user's question directly. Keep it practical, Indian-finance aware, and under 180 words.`;

    return await callGemini(prompt);
  } catch (error) {
    console.error("Gemini insight error:", error);
    return null;
  }
}
