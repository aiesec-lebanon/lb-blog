"use client";

import { createContext, useContext, useEffect, useState } from "react";
import UserInfo from "@/types/user-types";

type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 👇 Handle guest vs AIESEC user
        if (data.isGuest) {
          setUser({
            username: data.username,
            isGuest: true,
          });
        } else {
          setUser({
            ...data,
            username: data.username || data.full_name?.trim() || "",
            isGuest: false,
          });
        }

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