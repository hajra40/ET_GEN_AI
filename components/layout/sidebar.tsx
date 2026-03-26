"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  CircleDollarSign,
  Flame,
  HeartPulse,
  House,
  LayoutDashboard,
  PiggyBank,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: House },
  { href: "/fire-planner", label: "FIRE Path Planner", icon: Flame },
  { href: "/money-health", label: "Money Health Score", icon: HeartPulse },
  { href: "/life-events", label: "Life Event Advisor", icon: ShieldCheck },
  { href: "/tax-wizard", label: "Tax Wizard", icon: CircleDollarSign },
  { href: "/couple-planner", label: "Couple's Money Planner", icon: Users },
  { href: "/portfolio-xray", label: "Mutual Fund Portfolio X-Ray", icon: PiggyBank },
  { href: "/insights", label: "AI Insights", icon: BrainCircuit },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur xl:flex">
      <div className="mb-8 space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">AI Money Mentor</h2>
          <p className="text-sm text-muted-foreground">ET-ready personal finance workspace for Indian savers.</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
        <p className="font-semibold">Hackathon Demo Mode</p>
        <p className="mt-1 leading-6">Five seeded Indian user profiles are available, including a couple plan and a portfolio-heavy user.</p>
      </div>
    </aside>
  );
}
