import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function shouldLockProductionApp() {
  return process.env.VERCEL_ENV === "production" && process.env.LIVE_APP_ENABLED !== "true";
}

export default async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (shouldLockProductionApp() && (pathname.startsWith("/app") || pathname === "/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/app")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/login", request.url);
      signInUrl.searchParams.set("callbackUrl", `${pathname}${url.search}`);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
