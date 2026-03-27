import { redirect } from "next/navigation";
import { clearSession, getServerSession } from "@/lib/auth/session";
import { getProfileByEmail } from "@/lib/data/store";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const profile = getProfileByEmail(session.email);
  if (!profile) {
    try {
      clearSession();
    } catch {
      // Best-effort cleanup for stale cookies created before the in-memory store reset.
    }

    redirect("/login");
  }

  redirect("/dashboard");
}
