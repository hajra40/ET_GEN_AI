"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, CircleDollarSign, Flame, HeartPulse, LayoutDashboard, PiggyBank, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/money-health", label: "Health", icon: HeartPulse },
  { href: "/fire-planner", label: "FIRE", icon: Flame },
  { href: "/tax-wizard", label: "Tax", icon: CircleDollarSign },
  { href: "/couple-planner", label: "Couple", icon: Users },
  { href: "/portfolio-xray", label: "Portfolio", icon: PiggyBank },
  { href: "/insights", label: "AI", icon: BrainCircuit }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="xl:hidden">
      <div className="flex gap-2 overflow-x-auto rounded-[24px] border border-white/80 bg-white/80 p-2 shadow-card backdrop-blur">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium",
                active ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
