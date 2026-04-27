import { NextRequest, NextResponse } from "next/server";

/**
 * ------------------------------------------------------------
 * AUTHENTICATION MIDDLEWARE
 * ------------------------------------------------------------
 *
 * This middleware protects application routes by ensuring
 * that a valid authentication session exists before allowing
 * access to protected pages.
 *
 * The middleware runs **before every matched request** and
 * performs the following checks:
 *
 * 1. Read authentication cookies from the request
 * 2. If the access token is expired → redirect to refresh flow
 * 3. If no access token exists → redirect to login
 * 4. If a valid token exists → allow request to proceed
 *
 * This approach provides a centralized authentication guard
 * so individual pages do not need to implement auth checks.
 */

export function proxy(req: NextRequest) {

    /**
     * ------------------------------------------------------------
     * RETRIEVE AUTHENTICATION COOKIES
     * ------------------------------------------------------------
     *
     * These cookies are created during the OAuth callback
     * (/api/auth/callback) after successful login.
     */

    const aiesecToken = req.cookies.get("aiesec_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const tokenExpiresAt = req.cookies.get("token_expires_at")?.value;
    const guestToken = req.cookies.get("guest_token")?.value;

    /**
     * ------------------------------------------------------------
     * TOKEN EXPIRATION CHECK
     * ------------------------------------------------------------
     *
     * If the access token has expired, we redirect the request
     * to the refresh endpoint which will:
     *
     * 1. Use the refresh token to obtain a new access token
     * 2. Update authentication cookies
     * 3. Redirect the user back to the original page
     *
     * This allows seamless session renewal without requiring
     * the user to log in again.
     */

    if (tokenExpiresAt && Date.now() > Number(tokenExpiresAt) * 1000) {

        /**
         * If a refresh token does not exist, the session
         * cannot be renewed and the user must log in again.
         */
        if (!refreshToken) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        /**
         * Redirect to refresh endpoint and preserve the
         * originally requested path so the user returns
         * to the same page after refreshing the session.
         */
        const refreshUrl = new URL("/api/auth/refresh", req.url);
        refreshUrl.searchParams.set("redirect", req.nextUrl.pathname);

        return NextResponse.redirect(refreshUrl);
    }

    /**
     * ------------------------------------------------------------
     * AUTHENTICATION CHECK
     * ------------------------------------------------------------
     *
     * If no access token exists, the user is not authenticated
     * and must be redirected to the login page.
     */

    if (!aiesecToken && !guestToken) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    /**
     * ------------------------------------------------------------
     * AUTHORIZED REQUEST
     * ------------------------------------------------------------
     *
     * If a valid token exists and is not expired, the request
     * is allowed to continue to the requested page or API route.
     */

    return NextResponse.next();
}


/**
 * ------------------------------------------------------------
 * MIDDLEWARE ROUTE MATCHER
 * ------------------------------------------------------------
 *
 * Defines which routes the middleware should run on.
 *
 * The pattern below applies authentication protection to
 * all routes except those explicitly excluded.
 *
 * Developers using this template can modify this list to
 * allow additional public routes.
 */

export const config = {
  matcher: [
    /*
     * Apply to all routes except:
     *
     * - /login              → authentication entry point
     * - /api/auth/*         → OAuth callback and auth endpoints
     * - /unauthorized       → page shown when user lacks permission
     * - /_next/static/*     → Next.js static assets
     * - /_next/image/*      → Next.js optimized images
     * - static files        → public assets
     */
    "/((?!login|api/auth|unauthorized|_next/static|_next/image|blue_house.png|blue_house_bg.svg).*)",
  ],
};