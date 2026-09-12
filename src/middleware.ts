import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { parseUtmParams, hasAnyUtm, serializeUtm } from "@/lib/utm";
import { UTM_COOKIE_NAME } from "@/lib/constants";

const UTM_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const utm = parseUtmParams(searchParams);
  if (hasAnyUtm(utm)) {
    response.cookies.set(UTM_COOKIE_NAME, serializeUtm(utm), {
      maxAge: UTM_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt|xml)$).*)",
  ],
};
