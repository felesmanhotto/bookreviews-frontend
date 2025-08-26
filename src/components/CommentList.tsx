"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Comment } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function CommentList({ reviewId, reloadKey = 0 }: { reviewId: number; reloadKey?: number; }) {
    const { user, token } = useAuth();
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
      // reset quando reviewId ou reloadKey mudar
      setItems([]);
      setOffset(0);
      setHasMore(true);
      load(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId, reloadKey]);
  
    async function onDelete(id: number) {
      if (!token) {
        alert("Login required");
        return;
      }
      if (!confirm("Delete this comment?")) return;
      try {
        await apiFetch(`/comments/${id}`, { method: "DELETE" }, token);
        setItems(prev => prev.filter(c => c.id !== id));
      } catch (e: any) {
        alert(e.message || "Failed to delete comment");
      }
    }
    

    return (
      <div className="space-y-3">
        {items.length === 0 && !loading && (
          <p className="text-sm text-slate-400">No comments yet.</p>
        )}
        {items.map(c => {
          const isOwner = user?.id === c.user_id;
          return (
            <div key={c.id} className="rounded-lg border border-slate-800 bg-sky-950 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <span className="font-medium">{c.user_name}</span>
                  <span className="text-slate-500"> · user #{c.user_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {c.created_at && (
                    <span className="text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => onDelete(c.id)}
                      className="text-xs px-2 py-1 rounded border border-red-500/40 bg-red-600/10 text-red-300 hover:bg-red-600/20"
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-100">{c.content}</p>
            </div>
          );
        })}
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
  
