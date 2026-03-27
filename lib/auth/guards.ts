import { redirect } from "next/navigation";
import { clearSession, getServerSession } from "@/lib/auth/session";
import { getProfileByEmail } from "@/lib/data/store";

export async function requireSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireProfile() {
  const session = await requireSession();
  const profile = getProfileByEmail(session.email);

  if (!profile) {
    // On serverless platforms a stale cookie can outlive the in-memory demo store.
    // Clear it when possible so the next request lands cleanly on the login flow.
    try {
      clearSession();
    } catch {
      // Cookie mutation is best-effort here; redirecting still prevents app shell crashes.
    }

    redirect("/login");
  }

  return profile;
}
