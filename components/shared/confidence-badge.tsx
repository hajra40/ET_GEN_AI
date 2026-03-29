"use client";

import type { ConfidenceBadge as ConfidenceBadgeModel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function getTone(label: ConfidenceBadgeModel["label"]) {
  switch (label) {
    case "exact":
      return "bg-emerald-100 text-emerald-800";
    case "estimated":
      return "bg-amber-100 text-amber-900";
    case "demo":
      return "bg-sky-100 text-sky-900";
    case "unavailable":
    default:
      return "bg-rose-100 text-rose-800";
  }
}

export function ConfidenceBadge({
  confidence
}: {
  confidence?: ConfidenceBadgeModel;
}) {
  if (!confidence) {
    return null;
  }

  return (
    <Badge className={getTone(confidence.label)}>
      {confidence.label.toUpperCase()} {confidence.score ? `(${confidence.score}/100)` : ""}
    </Badge>
  );
}
