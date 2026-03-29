"use client";

import type {
  ConfidenceBadge as ConfidenceBadgeModel,
  FinancialAssumption,
  SourceMeta
} from "@/lib/types";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { SourceBadge } from "@/components/shared/source-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatAssumptionValue(assumption: FinancialAssumption) {
  if (typeof assumption.value === "boolean") {
    return assumption.value ? "Yes" : "No";
  }

  if (assumption.unit === "percent") {
    return `${assumption.value}%`;
  }

  if (assumption.unit === "rupees") {
    return `Rs.${Number(assumption.value).toLocaleString("en-IN")}`;
  }

  return `${assumption.value} ${assumption.unit}`;
}

export function AssumptionsPanel({
  title = "Assumptions and trust",
  description = "What the planner assumed, how strong the data is, and what could improve accuracy.",
  assumptions = [],
  confidence,
  sources = [],
  missingInputs = []
}: {
  title?: string;
  description?: string;
  assumptions?: FinancialAssumption[];
  confidence?: ConfidenceBadgeModel;
  sources?: SourceMeta[];
  missingInputs?: string[];
}) {
  return (
    <Card>
      <CardHeader className="flex-col items-start gap-3">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <ConfidenceBadge confidence={confidence} />
          {sources.slice(0, 3).map((source) => (
            <SourceBadge key={`${source.provider}-${source.label}`} source={source} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-3">
          {assumptions.length ? (
            assumptions.filter((assumption) => assumption.userVisible).map((assumption) => (
              <div
                key={assumption.id}
                className="rounded-2xl border border-border/70 bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{assumption.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatAssumptionValue(assumption)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {assumption.description}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
              No explicit assumptions were attached to this result yet.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
            <p className="font-semibold">Confidence note</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {confidence?.explanation ?? "Confidence details are not available for this module yet."}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
            <p className="font-semibold">Missing inputs that could improve accuracy</p>
            <div className="mt-2 space-y-2">
              {missingInputs.length ? (
                missingInputs.map((item) => (
                  <p key={item} className="text-sm leading-6 text-muted-foreground">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No major missing inputs were flagged for this module.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
