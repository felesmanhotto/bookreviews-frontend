"use client";

import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Review, Book } from "@/types";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id; // string

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 3;
  const [hasMore, setHasMore] = useState(true);

  async function loadUser() {
    const u = await apiFetch<User>(`/users/${id}`);
    setUser(u);
  }

  async function loadMore(initial = false) {
    if (!hasMore && !initial) return;
    setLoading(true);
    try {
      const newItems = await apiFetch<Review[]>(`/users/${id}/reviews?limit=${limit}&offset=${initial ? 0 : offset}`);
      setReviews(prev => (initial ? newItems : [...prev, ...newItems]));
      setOffset(o => (initial ? newItems.length : o + newItems.length));
      setHasMore(newItems.length === limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <section className="bg-sky-950 p-4 rounded-xl border shadow-sm">
        <h1 className="text-xl font-bold">{user.name}</h1>
        {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
        <p className="text-xs text-slate-500 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {reviews.length === 0 && !loading && <p className="text-sm text-slate-600">No reviews yet.</p>}
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        <div className="flex justify-center">
          {hasMore &&
          <button onClick={() => loadMore()} disabled={loading} className="px-4 py-2 border rounded bg-sky-950">
            {loading ? "Loading..." : "Load more"}
          </button>}
        </div>
      </section>
    </div>
  );
}
