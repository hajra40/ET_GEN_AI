import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export function Topbar({
  name,
  email
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-card backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {getInitials(name)}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Workspace</p>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-accent text-accent-foreground">
          <Sparkles className="mr-1 h-3 w-3" />
          Deterministic finance engine + AI-style explainers
        </Badge>
        <Button asChild variant="outline">
          <Link href="/api/auth/logout">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  );
}
