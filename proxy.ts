import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {}
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/proxy")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/proxy/:path*"],
};
