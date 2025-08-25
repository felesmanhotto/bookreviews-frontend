"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Comment } from "@/types";

export default function CommentList({ reviewId }: { reviewId: number }) {
    const [items, setItems] = useState<Comment[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;
  
    async function load(initial = false) {
      if (!hasMore && !initial) return;
      setLoading(true);
      try {
        const data = await apiFetch<Comment[]>(
          `/comments/review/${reviewId}?limit=${limit}&offset=${initial ? 0 : offset}`
        );
        setItems((prev) => (initial ? data : [...prev, ...data]));
        setOffset((o) => (initial ? data.length : o + data.length));
        setHasMore(data.length === limit);
      } finally {
        setLoading(false);
      }
    }


  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);
  
  return (
    <div className="space-y-3">
      {items.length === 0 && !loading && (
        <p className="text-sm text-slate-400">No comments yet.</p>
      )}
      {items.map((c) => (
        <div key={c.id} className="rounded-lg border border-slate-800 bg-sky-950 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">user #{c.user_id}</span>
            {c.created_at && (
              <span className="text-xs text-slate-500">
                {new Date(c.created_at).toLocaleString()}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-100">{c.content}</p>
        </div>
      ))}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => load()}
            disabled={loading}
            className="px-3 py-1 rounded border border-slate-700 bg-slate-900 text-sm"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
