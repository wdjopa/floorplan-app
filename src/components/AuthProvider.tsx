"use client";

import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading, error } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    localStorage.removeItem("token");
    window.location.reload()
    return <div>Error: {error.message}</div>;
  }

  return children;
}
