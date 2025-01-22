// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyHmac } from "./utils/auth";

export async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const companyId = searchParams.get("company_id");

  // Skip middleware for callback route
  if (request.nextUrl.pathname.startsWith("/api/callback")) {
    return NextResponse.next();
  }

  // If accessing floorplan without company_id
  if (request.nextUrl.pathname.startsWith("/floorplan") && !companyId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If we have company_id, validate HMAC
  if (companyId) {
    const hmac = searchParams.get("hmac");
    const timestamp = searchParams.get("timestamp");

    if (!hmac || !timestamp) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const params = Object.fromEntries(searchParams.entries());
    const isValid = await verifyHmac(params, process.env.CLIENT_SECRET!);

    if (!isValid) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/floorplan/:path*"],
};
