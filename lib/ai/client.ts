export async function fetchAiSummary(prompt: string, context: string) {
  try {
    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, context })
    });

    const data = (await response.json()) as { success?: boolean; summary?: string; error?: string };

    if (!response.ok) {
      return data.error ?? "AI summary temporarily unavailable. Please try again later.";
    }

    return data.summary ?? "AI summary temporarily unavailable. Please try again later.";
  } catch {
    return "AI summary temporarily unavailable. Please try again later.";
  }
}
