import "server-only";

import type { InsightPromptContext } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { featureFlags } from "@/lib/config/feature-flags";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  promptFeedback?: unknown;
}

export class GeminiServiceError extends Error {
  statusCode: number;
  rawBody?: string;

  constructor(message: string, statusCode = 500, rawBody?: string) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
    this.rawBody = rawBody;
  }
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiServiceError("Missing GEMINI_API_KEY. Add it to .env.local and restart the Next.js server.", 500);
  }

  return apiKey;
}

function getGeminiModel() {
  const configuredModel = (process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim();
  const normalizedModel = configuredModel.replace(/^models\//, "");

  if (!normalizedModel || !/^gemini-[a-z0-9.-]+$/i.test(normalizedModel)) {
    throw new GeminiServiceError(`Invalid Gemini model name: "${configuredModel}".`, 500);
  }

  return normalizedModel;
}

function buildGeminiEndpoint(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function normalizePrompt(input: string, fieldName: string) {
  const normalized = input.trim();

  if (!normalized) {
    throw new GeminiServiceError(`${fieldName} cannot be empty.`, 400);
  }

  return normalized;
}

function extractGeneratedText(response: GeminiResponse) {
  const text = response.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new GeminiServiceError("Gemini returned an unexpected response shape with no generated text.", 500, JSON.stringify(response));
  }

  return text;
}

async function callGemini(prompt: string) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const endpoint = buildGeminiEndpoint(model);
  const normalizedPrompt = normalizePrompt(prompt, "Gemini prompt");

  let response: Response;

  try {
    response = await fetch(endpoint, {
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
                text: normalizedPrompt
              }
            ]
          }
        ]
      }),
      cache: "no-store"
    });
  } catch (error) {
    throw new GeminiServiceError(
      `Unable to reach Gemini API: ${error instanceof Error ? error.message : "Unknown network error."}`,
      500
    );
  }

  const rawBody = await response.text();

  if (!response.ok) {
    console.error("Gemini API error response", {
      status: response.status,
      model,
      body: rawBody
    });

    throw new GeminiServiceError(
      `Gemini API error: ${response.status}. Raw response: ${rawBody || "<empty body>"}`,
      response.status === 400 ? 400 : 500,
      rawBody
    );
  }

  if (!rawBody.trim()) {
    throw new GeminiServiceError("Gemini returned an empty response body.", 500);
  }

  let parsed: GeminiResponse;

  try {
    parsed = JSON.parse(rawBody) as GeminiResponse;
  } catch {
    throw new GeminiServiceError(`Gemini returned non-JSON content: ${rawBody}`, 500, rawBody);
  }

  return extractGeneratedText(parsed);
}

export async function generateAISummary(prompt: string, context: string) {
  if (!featureFlags.enableGeminiSummaries) {
    throw new GeminiServiceError("Gemini summaries are disabled by feature flag.", 500);
  }

  const normalizedPrompt = normalizePrompt(prompt, "Summary prompt");
  const normalizedContext = normalizePrompt(context, "Summary context");
  const fullPrompt = `You are AI Money Mentor, a careful Indian personal finance mentor.
Give concise, practical advice in simple language.
Do not promise guaranteed returns.
Keep the answer under 150 words.
Use rupee amounts where relevant.

Task:
${normalizedPrompt}

Context:
${normalizedContext}`;

  return callGemini(fullPrompt);
}

export async function generateGeminiInsight(question: string, context: InsightPromptContext) {
  if (!featureFlags.enableGeminiSummaries) {
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
