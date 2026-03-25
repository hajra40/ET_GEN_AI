import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
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
    redirect("/login");
  }

  return profile;
}
