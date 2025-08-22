"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // SSR e 1º render no cliente evita mismatch
  if (!mounted) {
    return (
      <div className="border-b bg-sky-950">
        <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">BookReviews</Link>
          <div className="space-x-4 text-sm">
            <Link href="/search">Search</Link>
            {/* placeholder sem depender de user */}
            <span className="opacity-0">.</span>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-800 bg-sky-950 text-slate-100">
      <nav className="mx-auto max-w-5xl px-4 h-20 flex items-center justify-between">
        <Link href="/" className="font-bold">BookReviews</Link>
        <div className="space-x-4 text-sm">
          <Link href="/search">Search</Link>
          {user ? (
            <>
              <Link href={`/users/${user.id}`}>{user.name}</Link>
              <button onClick={logout} className="underline">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
