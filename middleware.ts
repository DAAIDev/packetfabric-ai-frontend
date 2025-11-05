import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get session
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  // Protect /chat route
  if (request.nextUrl.pathname.startsWith("/chat")) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to home if already logged in and trying to access /login
  if (request.nextUrl.pathname === "/login") {
    if (session.isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - except auth endpoints are handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
