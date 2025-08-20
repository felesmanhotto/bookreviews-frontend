"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LikeButton({ reviewId }: { reviewId: number }) {
  const { token } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function refresh() {
    try {
      const { likes } = await apiFetch<{ likes: number }>(`/reviews/${reviewId}/likes/count`);
      setCount(likes);
      if (token) {
        const me = await apiFetch<{ liked: boolean }>(`/reviews/${reviewId}/likes/me`, {}, token);
        setLiked(me.liked);
      } else {
        setLiked(false);
      }
    } catch {

    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token, reviewId]);

  async function toggle() {
    if (!token) {
      alert("Login required to like reviews.");
      return;
    }
    setLoading(true);
    // optimistic update (updates UI before api's response)
    setLiked(v => !v);
    setCount(c => (liked ? Math.max(0, c - 1) : c + 1));
    try {
      const res = await apiFetch<{ liked: boolean }>(`/reviews/${reviewId}/like`, { method: "POST" }, token);
      // reconcile
      setLiked(res.liked);
      setCount(c => (res.liked ? Math.max(c, 1) : Math.max(0, c)));
    } catch (e) {
      // rollback if failed
      setLiked(v => !v);
      setCount(c => (liked ? c + 1 : Math.max(0, c - 1)));
      alert("Failed to toggle like.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={liked ? "Unlike" : "Like"}
      className={`flex items-center gap-1 px-2 py-1 rounded-full border transition-all
        ${liked 
          ? "text-white border-red-500" 
          : "text-slate-500 border-slate-500"}
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}