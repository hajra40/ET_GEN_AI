import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({
  name,
  email,
  children
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-mesh px-4 py-4 md:px-6 lg:px-8">
      <div className="app-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto flex max-w-[1600px] gap-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <Topbar name={name} email={email} />
          <MobileNav />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
