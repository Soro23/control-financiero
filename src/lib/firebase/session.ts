import { cookies } from "next/headers";
import { adminAuth } from "./server";
import type { DecodedIdToken } from "firebase-admin/auth";

/**
 * Lee el usuario actual desde la cookie de sesión (server components).
 * Devuelve null si no hay sesión o si la cookie es inválida.
 */
export async function getServerUser(): Promise<DecodedIdToken | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch {
    return null;
  }
}
