const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates[0]?.content?.parts[0]?.text ?? "Unable to generate summary.";
}

export async function generateAISummary(
  prompt: string,
  context: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "AI summary unavailable. Add GEMINI_API_KEY to your .env file to enable AI-powered insights.";
  }

  try {
    const fullPrompt = `You are a friendly Indian personal finance mentor. Provide concise, actionable financial advice in simple language. Use rupee amounts where relevant. Keep responses under 150 words.

${prompt}

Context:
${context}`;

    return await callGeminiAPI(fullPrompt, apiKey);
  } catch (error) {
    console.error("Gemini API error:", error);
    return "AI summary temporarily unavailable. Please try again later.";
  }
}