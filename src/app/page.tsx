"use client";

import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Book, Review } from "@/types";

export default function HomePage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<"global"|"following">("global");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 3;
  const [hasMore, setHasMore] = useState(true);

  async function load(initial = false) {
    if (!hasMore && !initial) return;
    setLoading(true);
    try {
      const base = tab === "global" ? '/reviews/feed' : '/follows/me/feed';
      const newItems = await apiFetch<Review[]>(`${base}?limit=${limit}&offset=${initial ? 0 : offset}`, {}, tab === "following" ? token : null);
      setReviews(prev => (initial ? newItems : [...prev, ...newItems]));
      setOffset(o => (initial ? newItems.length : o + newItems.length));
      setHasMore(newItems.length === limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setReviews([]); setOffset(0); setHasMore(true); 
    if (tab === "following" && !token) {
      // usuário não logado: não dá para carregar esse feed
      setHasMore(false);
      return;
    }
    load(true); /* eslint-disable-next-line */}, [tab, token]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={()=>setTab("global")} className={`px-3 py-1 rounded ${tab==="global"?"bg-slate-700 text-white":"bg-slate-100 text-slate-900"}`}>Global</button>
        <button onClick={()=>setTab("following")} className={`px-3 py-1 rounded ${tab==="following"?"bg-slate-700 text-white":"bg-slate-100 text-slate-900"}`}>Following</button>
      </div>
      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      {hasMore && <div className="flex justify-center">
        <button onClick={()=>load()} disabled={loading} className="px-4 py-2 border rounded bg-sky-950">{loading?"Loading…":"Load more"}</button>
      </div>}
      {!loading && reviews.length===0 && <p className="text-sm text-slate-400">Nothing here yet.</p>}
    </div>
  );
}
