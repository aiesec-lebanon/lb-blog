import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * ------------------------------------------------------------
 * AUTHENTICATED USER ENDPOINT
 * ------------------------------------------------------------
 * GET /api/auth/me
 *
 * This endpoint returns the currently authenticated user based
 * on the session cookies set during the OAuth login process.
 *
 * It is primarily used by the frontend AuthProvider to restore
 * authentication state when the application loads.
 *
 * Expected behavior:
 * - If a valid "user" cookie exists → return user information
 * - If no user cookie exists → return 401 (not authenticated)
 *
 * The "user" cookie is created during the OAuth callback
 * (/api/auth/callback) after successful authentication.
 */

export async function GET() {

    /**
     * Retrieve cookies from the incoming request
     */
    const cookieStore = await cookies();

    /**
     * Attempt to read the cached user information stored in cookies
     */
    const user = cookieStore.get("user")?.value;

    /**
     * If no user cookie exists, the user is not authenticated
     */
    if (!user) {
        return NextResponse.json(null, { status: 401 });
    }

    /**
     * Return the user object to the client
     *
     * The cookie stores the user as a JSON string,
     * so we parse it before sending the response.
     */
    return NextResponse.json(JSON.parse(user));
}