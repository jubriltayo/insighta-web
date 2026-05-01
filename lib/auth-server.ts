import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface User {
  id: string;
  github_id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: "admin" | "analyst";
  is_active: boolean;
  last_login_at: string;
  created_at: string;
}

/**
 * Called from Server Components.
 * Forwards the browser's cookies to the backend so the backend can
 * validate the HTTP-only session cookie it set.
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}