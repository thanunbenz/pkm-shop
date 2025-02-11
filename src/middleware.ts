import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (request.nextUrl.pathname.startsWith("/%")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session) {
    if (
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (session?.user?.role !== "admin") {
        const url = new URL("/login", request.url);
        url.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
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
