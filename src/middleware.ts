import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Redirect invalid URL patterns
  if (request.nextUrl.pathname.startsWith("/%")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is logged in
  if (token) {
    // Redirect authenticated users away from auth pages
    if (
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check STAFF role (OPERATOR or ADMIN) for dashboard access
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const isStaff = token.role === "OPERATOR" || token.role === "ADMIN";

      if (!isStaff) {
        // Regular users cannot access dashboard
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ADMIN-only routes (settings)
      const adminOnlyRoutes = [
        "/dashboard/settings",
        "/dashboard/roles",
        "/dashboard/system",
      ];

      const isAdminRoute = adminOnlyRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
      );

      if (isAdminRoute && token.role !== "ADMIN") {
        // OPERATOR cannot access ADMIN-only routes
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } else {
    // If user is NOT logged in and trying to access protected routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/%:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};
