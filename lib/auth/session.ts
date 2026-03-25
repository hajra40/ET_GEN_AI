import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "ai-money-mentor-session";

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE)?.value;

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  cookies().set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
