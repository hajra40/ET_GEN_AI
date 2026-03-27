"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buildLifeEventPlan, getLifeEventQuestions } from "@/lib/calculators/life-events";
import { fetchAiSummary } from "@/lib/ai/client";
import type { LifeEventType, UserProfile } from "@/lib/types";
import { demoLifeEventOptions } from "@/lib/data/demo-meta";

export function LifeEventAdvisor({
  profile
}: {
  profile: UserProfile;
}) {
  const [aiSummary, setAiSummary] = useState<string>("Loading AI insights...");
  const [eventType, setEventType] = useState<LifeEventType>("annual_bonus");
  const [answers, setAnswers] = useState<Record<string, string | number>>({
    bonusAmount: 500000,
    highInterestDebt: 0,
    goalWithin3Years: "Home down payment"
  });

  const questions = getLifeEventQuestions(eventType);
  const plan = buildLifeEventPlan(profile, { eventType, answers });
  const aiPrompt = "Analyze this life event scenario and provide personalized financial advice for handling this situation.";
  const aiContext = `Life Event: ${eventType}, Answers: ${JSON.stringify(answers)}, Emergency Fund Change: ${plan.emergencyFundChange}, Allocation Update: ${plan.allocationUpdate}, Insurance & Tax: ${plan.insuranceAndTaxNote}`;

  useEffect(() => {
    let active = true;

    void fetchAiSummary(aiPrompt, aiContext).then((summary) => {
      if (active) {
        setAiSummary(summary);
      }
    });

    return () => {
      active = false;
    };
  }, [aiPrompt, aiContext]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Life Event Advisor"
        title="Turn money shocks into a structured plan"
        description="Choose an event and get a rules-based action plan covering liquidity, investing, insurance, tax, and timing."
        badge="Now / 3 months / 12 months"
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Event Setup</CardTitle>
            <CardDescription>Event-specific questions tailor the action plan.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select
            label="Life event type"
            value={eventType}
            onChange={(event) => {
              const nextType = event.target.value as LifeEventType;
              setEventType(nextType);
              const freshAnswers: Record<string, string | number> = {};
              getLifeEventQuestions(nextType).forEach((question) => {
                freshAnswers[question.id] = question.type === "number" ? Number(question.placeholder ?? 0) : question.placeholder ?? "";
              });
              setAnswers(freshAnswers);
            }}
          >
            {demoLifeEventOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="text-sm leading-6 text-muted-foreground">
            The planner keeps calculations deterministic and converts them into plain-English action steps.
          </div>

          {questions.map((question) => (
            <Input
              key={question.id}
              label={question.label}
              type={question.type === "number" ? "number" : "text"}
              value={String(answers[question.id] ?? "")}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [question.id]: question.type === "number" ? Number(event.target.value) : event.target.value
                }))
              }
              placeholder="e.g. 500000"
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Core Guidance</CardTitle>
              <CardDescription>Immediate financial guardrails for this event.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">Emergency Fund</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.emergencyFundChange}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">Allocation Update</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.allocationUpdate}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
              <p className="font-semibold">Insurance & Tax</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.insuranceAndTaxNote}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>AI Mentor Summary</CardTitle>
                <CardDescription>Personalized life event advice powered by AI.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{aiSummary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Do now", items: plan.now },
              { title: "In 3 months", items: plan.in3Months },
              { title: "In 12 months", items: plan.in12Months }
            ].map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
