import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 60;

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req;

    // 1. Rate Limiting for API routes
    if (nextUrl.pathname.startsWith('/api/')) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const now = Date.now();
      const windowStart = now - RATE_LIMIT_WINDOW;

      const currentRecord = rateLimitMap.get(ip) || { count: 0, lastReset: now };
      if (currentRecord.lastReset < windowStart) {
        currentRecord.count = 0;
        currentRecord.lastReset = now;
      }
      currentRecord.count++;
      rateLimitMap.set(ip, currentRecord);

      if (currentRecord.count > MAX_REQUESTS_PER_MINUTE) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Auth & Premium Routing
    const isPremiumRoute =
      nextUrl.pathname.startsWith('/betting') ||
      nextUrl.pathname.startsWith('/matchup');

    if (isPremiumRoute) {
      if (!req.nextauth.token?.isPremium) {
        return NextResponse.redirect(new URL("/pricing?reason=premium", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Only require auth for specific paths
        if (
          req.nextUrl.pathname.startsWith('/dashboard') ||
          req.nextUrl.pathname.startsWith('/betting') ||
          req.nextUrl.pathname.startsWith('/matchup')
        ) {
          return !!token;
        }
        return true; // Let everyone pass to public routes like /predictions, /api, etc.
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/betting/:path*",
    "/matchup/:path*",
    "/api/:path*",
  ],
};
