"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  bio?: string | null;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]   = useState<string | null>(null);
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    const me = await apiFetch<User>("/me", {}, t);
    setUser(me);
  }, []);

  // restaura token e carrega /me uma vez
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }
    setToken(t);
    (async () => {
      try {
        await fetchMe(t);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMe]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "token") return;
      const t = e.newValue;
      setLoading(true);
      if (!t) {
        setToken(null);
        setUser(null);
        setLoading(false);
      } else {
        setToken(t);
        fetchMe(t).catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }).finally(() => setLoading(false));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/login`, { method: "POST", body });
    if (!res.ok) {
      setLoading(false);
      throw new Error("Invalid credentials");
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    try {
      await fetchMe(data.access_token);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // loading pode ficar false, não há nada para buscar
  };

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
