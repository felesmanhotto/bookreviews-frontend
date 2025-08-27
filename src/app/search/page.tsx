"use client";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { BookCard } from "@/components/BookCard";
import { useState, useEffect, useMemo, useRef } from "react";
import { Book } from "@/types";
import CreateReviewModal from "@/components/CreateReviewModal";

export default function SearchPage() {
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Book | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (q.trim().length < 2) { setBooks([]); setError(null); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Book[]>(`/books/search?q=${encodeURIComponent(q)}`);
        setBooks(data);
      } catch (e:any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce
    return () => { if (timer.current) clearTimeout(timer.current); }; 
  }, [q]);

  return (
    <div className="space-y-4">
      <form onSubmit={(e)=>e.preventDefault()} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2 bg-slate-950 border-slate-700"
          placeholder="Search by title or author…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
      </form>

      {loading && <p className="text-sm text-slate-400">Searching…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {books.map((b) => (
          <BookCard key={b.id} book={b} onReview={() => setSelected(b)} />
        ))}
      </div>

      <CreateReviewModal
        book={selected as any}
        open={!!selected}
        onClose={() => setSelected(null)}
        onCreated={() => {
          // opcional: toast/redirect
        }}
      />
    </div>
  );
}
