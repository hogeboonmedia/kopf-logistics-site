/**
 * Server-side helpers for reading the admin session in React Server Components
 * and Route Handlers. Middleware already gates the routes — this is defence
 * in depth + a way for admin pages to know who's logged in (for "added_by"
 * stamping on blocklist mutations, etc.).
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME, type AdminSession } from "@/lib/auth/session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

/** Force-redirect to /admin/ if no session. Use at the top of admin pages. */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/");
  return session;
}
