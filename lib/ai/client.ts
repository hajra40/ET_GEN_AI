export async function fetchAiSummary(prompt: string, context: string) {
  try {
    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      return "AI summary temporarily unavailable. Please try again later.";
    }

    const data = (await response.json()) as { summary?: string };
    return data.summary ?? "AI summary temporarily unavailable. Please try again later.";
  } catch {
    return "AI summary temporarily unavailable. Please try again later.";
  }
}
