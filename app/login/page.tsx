'use client';

import { useEffect } from 'react';

/**
 * ------------------------------------------------------------
 * LOGIN PAGE
 * ------------------------------------------------------------
 *
 * This page initiates the OAuth authentication flow.
 *
 * When the page loads, it automatically redirects the user
 * to the configured authentication provider's authorization
 * endpoint.
 *
 * The authentication provider will then:
 *
 * 1. Prompt the user to log in
 * 2. Redirect back to `/api/auth/callback`
 * 3. Include an authorization `code` in the query parameters
 *
 * That authorization code is later exchanged for an access token
 * in the callback route.
 *
 * Environment variables required:
 *
 * NEXT_PUBLIC_AUTH_URL
 *   → Base URL of the OAuth provider
 *
 * NEXT_PUBLIC_CLIENT_ID
 *   → OAuth client ID registered with the provider
 */

export default function LoginPage() {

  /**
   * Trigger OAuth authorization redirect when the page loads
   */
  useEffect(() => {

    /**
     * Build the authorization request parameters
     */
    const params = new URLSearchParams({
      response_type: 'code', // OAuth authorization code flow
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/api/auth/callback`,
    });

    /**
     * Redirect the user to the OAuth provider login page
     */
    window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/authorize?${params.toString()}`;

  }, []);

  /**
   * While the redirect is happening, show a simple loading spinner
   */
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}