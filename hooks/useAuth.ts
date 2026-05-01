"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/auth-server";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return { user, loading, logout, refetch: fetchUser };
}