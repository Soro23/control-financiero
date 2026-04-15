import { adminAuth } from "@/lib/firebase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME = "__session";
const EXPIRES_IN = 5 * 24 * 60 * 60 * 1000; // 5 días en ms

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: EXPIRES_IN / 1000,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: "ok" });
}
