"use client";

import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import { useEffect, useState } from "react";

type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };
type Review = { id: number; content: string; rating: number; user_id: number; book: Book };

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 3;
  const [hasMore, setHasMore] = useState(true);

  async function loadMore(initial = false) {
    if (!hasMore && !initial) return;
    setLoading(true);
    try {
      const newItems = await apiFetch<Review[]>(`/reviews/feed?limit=${limit}&offset=${initial ? 0 : offset}`);
      setReviews(prev => (initial ? newItems : [...prev, ...newItems]));
      setOffset(o => (initial ? newItems.length : o + newItems.length));
      setHasMore(newItems.length === limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMore(true); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-2">Recent reviews</h1>
      {reviews.length === 0 && !loading && <p>No reviews yet.</p>}
      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      <div className="flex justify-center">
        {hasMore &&
        <button onClick={() => loadMore()} disabled={loading} className="px-4 py-2 border rounded bg-sky-950">
          {loading ? "Loading..." : "Load more"}
        </button>}
      </div>
    </div>
  );
}
