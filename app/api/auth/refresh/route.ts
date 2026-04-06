'use server';

import TokenResponse from "@/types/auth-types";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * ------------------------------------------------------------
 * TOKEN REFRESH ENDPOINT
 * ------------------------------------------------------------
 * GET /api/auth/refresh
 *
 * This endpoint refreshes the OAuth access token when it has
 * expired. It is typically triggered by the authentication
 * middleware when the access token expiry time has passed.
 *
 * Flow:
 *
 * 1. Middleware detects expired access token
 * 2. Middleware redirects request to /api/auth/refresh
 * 3. This endpoint uses the refresh token to request a new
 *    access token from the OAuth provider
 * 4. New tokens are stored in cookies
 * 5. User is redirected back to the originally requested page
 *
 * This allows seamless session renewal without requiring the
 * user to log in again.
 */

export async function GET(req: NextRequest) {

    /**
     * Retrieve cookies from the request
     */
    const cookieStore = await cookies();

    /**
     * Retrieve refresh token stored during login
     *
     * This token was created during the OAuth callback
     * (/api/auth/callback) and allows the application to
     * request new access tokens without requiring the user
     * to reauthenticate.
     */
    const refreshToken = cookieStore.get("refresh_token")?.value;

    /**
     * If no refresh token exists, the session cannot be
     * renewed and the user must log in again.
     */
    if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {

        /**
         * Request a new access token using the refresh token
         * via the OAuth provider's token endpoint.
         */
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_REDIRECT_SERVICE_URL}/token`,
            {
                grant_type: "refresh_token",
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: refreshToken,
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const tokenData: TokenResponse = response.data;

        /**
         * Calculate new token expiration timestamp
         */
        const expiresAt = tokenData.created_at + tokenData.expires_in;

        /**
         * Determine where the user should be redirected after
         * the token refresh completes.
         *
         * Middleware passes the originally requested route
         * as a query parameter.
         */
        const redirectPath = req.nextUrl.searchParams.get("redirect") || "/";

        /**
         * Redirect user back to their original page
         */
        const res = NextResponse.redirect(new URL(redirectPath, req.url));

        /**
         * Store the new access token
         */
        res.cookies.set("aiesec_token", tokenData.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            expires: new Date(expiresAt * 1000),
        });

        /**
         * Update refresh token if the OAuth provider returned
         * a new one (some providers rotate refresh tokens)
         */
        res.cookies.set("refresh_token", tokenData.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        /**
         * Store updated token expiration timestamp
         */
        res.cookies.set("token_expires_at", expiresAt.toString(), {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        return res;

    } catch (error) {

        /**
         * If token refresh fails (invalid refresh token,
         * revoked session, network error, etc.), the user
         * must log in again.
         */
        return NextResponse.redirect(new URL("/login", req.url));
    }
}