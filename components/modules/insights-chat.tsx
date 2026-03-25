"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/lib/types";
import { sampleInsightPrompts } from "@/lib/ai/prompts";

export function InsightsChat({
  initialMessages
}: {
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(prompt = question) {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: prompt })
    });
    const data = (await response.json()) as { messages: ChatMessage[] };
    setMessages(data.messages);
    setQuestion("");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Insights"
        title="Ask what-if questions in plain English"
        description="The chat uses your computed money profile, not generic advice, to answer retirement, emergency fund, tax, and bonus questions."
        badge="Grounded in your profile"
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Suggested Prompts</CardTitle>
            <CardDescription>Tap a prompt or ask your own question.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {sampleInsightPrompts.map((prompt) => (
            <Button key={prompt} variant="outline" onClick={() => void sendMessage(prompt)}>
              {prompt}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Conversation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-4 text-sm leading-6 ${message.role === "assistant" ? "bg-secondary/50 text-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Can I retire by 45 if I keep my current lifestyle?"
            />
            <Button onClick={() => void sendMessage()} disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
