"use client";

import { createContext, useContext, useEffect, useState } from "react";
import UserInfo from "@/types/user-types";

/**
 * ------------------------------------------------------------
 * AUTH CONTEXT
 * ------------------------------------------------------------
 * This context provides authentication state across the entire
 * client-side application.
 *
 * It allows components to:
 * - Access the currently authenticated user
 * - Check whether authentication is still loading
 * - Log the user out
 *
 * The context is populated by calling `/api/auth/me`, which
 * should return the authenticated user's information if a
 * valid session cookie exists.
 */

/**
 * Shape of the authentication context
 */
type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  logout: () => Promise<void>;
};

/**
 * React context used to store authentication state.
 *
 * Initialized as null to ensure the `useAuth` hook can verify
 * that it is used within the AuthProvider.
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider
 *
 * Wrap this provider around your application (typically in
 * `layout.tsx` or `_app.tsx`) so that authentication state
 * is accessible from any component.
 *
 * Responsibilities:
 * - Fetch the current authenticated user
 * - Maintain loading state during authentication check
 * - Provide logout functionality
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * On initial load, fetch the authenticated user's information.
   *
   * This endpoint should return:
   * - user object if authenticated
   * - 401/403 if not authenticated
   */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          ...data,
          username: data.username || data.full_name?.trim() || "",
        });
        setLoading(false);
      });
  }, []);

  /**
   * Logout handler
   *
   * Calls the backend logout endpoint to clear cookies/session,
   * resets the local user state, and redirects to the login page.
   *
   * Developers may customize the redirect destination depending
   * on their application flow.
   */
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 *
 * Custom hook to access authentication state anywhere
 * in the application.
 *
 * Example:
 *
 * const { user, logout } = useAuth();
 */
export function useAuth() {

  const ctx = useContext(AuthContext);

  // Prevent usage outside AuthProvider
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}