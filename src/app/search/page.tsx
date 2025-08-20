"use client";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { BookCard } from "@/components/BookCard";
import { useState } from "react";

type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };

export default function SearchPage() {
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<Book[]>(`/books/search?q=${encodeURIComponent(q)}`);
      setBooks(res);
    } catch (e:any) {
      setError(e.message);
    }
  }

  async function createReview(b: Book) {
    if (!token) { alert("Login required"); return; }
    const content = prompt(`Your review for "${b.title}":`) || "";
    const ratingStr = prompt("Rating (1..5):") || "5";
    const rating = Math.min(5, Math.max(1, parseInt(ratingStr, 10) || 5));
    try {
      await apiFetch(`/reviews`, {
        method: "POST",
        body: JSON.stringify({ book_id: b.id, content, rating }),
      }, token);
      alert("Review created!");
    } catch (e:any) {
      alert(e.message || "Failed to create review");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2
                    text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring
                    focus:ring-sky-500/30"
          placeholder="Search books..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="rounded-lg bg-sky-700 px-5 py-2 font-medium text-white
                    hover:bg-sky-600 active:bg-sky-700/90 transition"
        >
          Search
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div
        className="
          grid gap-4
          [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]
        ">
        {books.map(b => <BookCard key={b.id} book={b} onSelect={createReview} />)}
      </div>

    </div>
  );
}
