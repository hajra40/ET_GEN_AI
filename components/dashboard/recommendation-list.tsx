import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";

export function RecommendationList({
  items
}: {
  items: Recommendation[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top Recommendations</CardTitle>
          <CardDescription>Prioritized based on the weakest parts of the financial profile.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-secondary/40 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {item.priority}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">{item.title}</h4>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
