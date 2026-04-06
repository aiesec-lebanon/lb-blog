import { NextResponse } from "next/server";

/**
 * ------------------------------------------------------------
 * LOGOUT ENDPOINT
 * ------------------------------------------------------------
 * POST /api/auth/logout
 *
 * This endpoint clears all authentication-related cookies,
 * effectively ending the user's session.
 *
 * It is typically called by the frontend when the user
 * clicks a "Logout" button.
 *
 * After this endpoint runs:
 * - Access tokens are removed
 * - Refresh tokens are removed
 * - Cached user information is removed
 *
 * The frontend should then redirect the user to the login page.
 */

export async function POST() {

  /**
   * Create a success response
   */
  const response = NextResponse.json({ ok: true });

  /**
   * Remove authentication cookies
   *
   * These cookies were originally set during the OAuth callback
   * when the user successfully logged in.
   */

  // OAuth access token
  response.cookies.delete("aiesec_token");

  // OAuth refresh token
  response.cookies.delete("refresh_token");

  // Cached token expiration (optional, can be used by frontend to determine when to refresh)
  response.cookies.delete("token_expires_at");

  // Cached user information
  response.cookies.delete("user");

  /**
   * Return success response
   */
  return response;
}