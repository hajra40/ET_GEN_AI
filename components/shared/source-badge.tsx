"use client";

import type { SourceMeta } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function SourceBadge({
  source
}: {
  source?: SourceMeta;
}) {
  if (!source) {
    return null;
  }

  return (
    <Badge className="bg-slate-100 text-slate-900">
      {source.provider}
      {source.asOf ? ` • ${source.asOf}` : ""}
    </Badge>
  );
}
