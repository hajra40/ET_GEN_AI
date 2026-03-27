import { redirect } from "next/navigation";
import { clearSession, getServerSession } from "@/lib/auth/session";
import { getProfileByEmail } from "@/lib/data/store";

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    const profile = await getProfileByEmail(session.email);

    if (profile) {
      redirect("/dashboard");
    }

    try {
      clearSession();
    } catch {
      // Ignore cookie mutation failures during render; we still avoid the redirect loop.
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh px-4 py-10">
      <div className="app-grid absolute inset-0 opacity-35" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="glass-panel hidden rounded-[36px] p-8 shadow-soft lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Economic Times Hackathon</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight text-balance">
              Personal finance clarity that feels as easy as checking WhatsApp.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              FIRE planning, money-health scoring, tax comparisons, couple planning, portfolio X-ray, and AI-style explanations in one serious fintech dashboard.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["95%", "Indians without a financial plan"],
              ["₹25k+", "Typical annual advisor cost"],
              ["5", "Seeded demo profiles for instant use"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}
