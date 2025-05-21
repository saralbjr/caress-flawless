import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getTokenFromAuthHeader } from "./utils/auth";

// Define routes that require authentication
const protectedRoutes = ["/account", "/checkout"];

// Define routes that are only for non-authenticated users
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const token = getTokenFromAuthHeader(request);
  const user = token ? verifyToken(token) : null;
  const isAuthenticated = !!user;

  // Handle protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes (login/signup) for authenticated users
  if (authRoutes.some((route) => pathname === route)) {
    if (isAuthenticated) {
      // Redirect already authenticated users to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (Next.js internals)
     * - api (API routes)
     * - static files (e.g. images, fonts)
     */
    "/((?!_next/|_static/|_vercel|api/|[\\w-]+\\.\\w+).*)",
  ],
};
