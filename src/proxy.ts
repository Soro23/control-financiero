import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Sin sesión intentando acceder a ruta privada → login
  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Con sesión intentando acceder a auth → dashboard
  if (sessionCookie && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
