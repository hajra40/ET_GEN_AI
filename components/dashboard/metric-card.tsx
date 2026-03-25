import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  className
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "flat";
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            trend === "up"
              ? "bg-emerald-100 text-emerald-700"
              : trend === "down"
                ? "bg-rose-100 text-rose-700"
                : "bg-secondary text-muted-foreground"
          )}
        >
          {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : trend === "down" ? <ArrowDownRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </div>
      </CardHeader>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </Card>
  );
}
