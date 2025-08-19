"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const me = await apiFetch<User>("/me", {}, t);
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    if (token) fetchMe(token).finally(() => setLoading(false));
    else setLoading(false);
  }, [token, fetchMe]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  

  const login = async (email: string, password: string) => {
    // /login é OAuth2 form-encoded: username, password
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/login`, {
      method: "POST",
      body,
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    await fetchMe(data.access_token);
  };

  const signup = async (name: string, email: string, password: string) => {
    await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ nome: name, email, senha: password }),
    });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
