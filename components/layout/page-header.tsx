import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
        </div>
      </div>
      {badge ? <Badge className="w-fit bg-accent text-accent-foreground">{badge}</Badge> : null}
    </div>
  );
}
