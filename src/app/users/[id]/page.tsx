"use client";

import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Review } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { user: me, token, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState(false);
  const limit = 3;

  // effect para renders que nao dependem do auth
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await apiFetch<User>(`/users/${userId}`);
      if (cancelled) return;
      setProfile(u);

      setReviews([]);
      setOffset(0);
      setHasMore(true);

      const data = await apiFetch<Review[]>(
        `/users/${userId}/reviews?limit=${limit}&offset=0`
      );
      if (cancelled) return;
      setReviews(data);
      setOffset(data.length);
      setHasMore(data.length === limit);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // effect para render que dependem do auth
  useEffect(() => {
    if (authLoading) return;
    if (!token || !me || me.id === userId) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const s = await apiFetch<{ following: boolean }>(
          `/follows/me/status/${userId}`,
          {},
          token
        );
        if (!cancelled) setFollowing(s.following);
      } catch {
        if (!cancelled) setFollowing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, token, me?.id, userId]);

  async function toggleFollow() {
    if (!token) { alert("Login required"); return; }
    if (following) {
      await apiFetch(`/follows/${userId}`, { method: "DELETE" }, token);
      setFollowing(false);
    } else {
      await apiFetch(`/follows/${userId}`, { method: "POST" }, token);
      setFollowing(true);
    }
  }

  async function loadMore() {
    if (!hasMore) return;
    setLoading(true);
    try {
      const data = await apiFetch<Review[]>(
        `/users/${userId}/reviews?limit=${limit}&offset=${offset}`
      );
      setReviews(prev => [...prev, ...data]);
      setOffset(o => o + data.length);
      setHasMore(data.length === limit);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) return <p>Loading…</p>;

  const isMe = me?.id === profile.id;

  return (
    <div className="space-y-4">
      <section className="bg-white/5 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            {profile.bio && <p className="text-sm text-slate-300 mt-1">{profile.bio}</p>}
            <p className="text-xs text-slate-500 mt-1">
              Joined: {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          {!isMe && (
            <button
              onClick={toggleFollow}
              className={`px-3 py-2 rounded ${following ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"}`}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        {hasMore && (
          <div className="flex justify-center">
            <button onClick={loadMore} disabled={loading} className="px-4 py-2 border rounded bg-sky-950">
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
