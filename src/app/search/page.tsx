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
        <input className="flex-1 border rounded p-2 bg-sky-950" placeholder="Search books..." value={q} onChange={e=>setQ(e.target.value)} />
        <button className="bg-sky-950 text-white rounded px-6">Search</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {books.map(b => (
          <BookCard key={b.id} book={b} onSelect={createReview} />
        ))}
      </div>
    </div>
  );
}
