import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "tusome_session";
const PROTECTED_PREFIXES = ["/student", "/teacher", "/admin"];

// Optimistic check only: confirms a session cookie exists so logged-out users
// are redirected before rendering. Full role/session verification happens in
// the DAL (src/lib/auth.ts) on every protected page.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
