"use client";

import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Review, UserCounters } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();   // id da url
  const userId = Number(params.id);
  const { user: me, token, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counters, setCounter] = useState<UserCounters | null>(null);

  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState<boolean | null>(null);
  const limit = 3;

  // effect para renders que nao dependem do auth
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await apiFetch<User>(`/users/${userId}`);
      if (cancelled) return;
      setProfile(u);

      const c = await apiFetch<UserCounters>(`/users/${userId}/counters`);
      if (cancelled) return;
      setCounter(c);

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

  if (!profile || !counters) return <p>Loading…</p>;

  const isMe = me?.id === profile.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* LEFT: Profile card (fixed/stable layout) */}
      <section className="md:col-span-1 rounded-2xl border border-slate-800 bg-sky-950 p-4">
        {/* Avatar placeholder (fixo) */}
        <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto" />
        {/* Nome (1 linha, truncado) */}
        <h1 className="mt-3 text-center text-lg font-semibold truncate" title={profile.name}>
          {profile.name}
        </h1>
        {/* Joined (posição fixa) */}
        <p className="mt-1 text-center text-xs text-slate-400">
          Joined {new Date(profile.created_at).toLocaleDateString()}
        </p>

        {/* Bio (altura reservada, não “empurra” layout) */}
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <p
            className="
              text-sm text-slate-200/90
              line-clamp-4
              min-h-[4.5rem]   /* ~3-4 linhas */
            "
          >
            {profile.bio || <span className="text-slate-500">No bio yet.</span>}
          </p>
        </div>

        {/* Counters (grade estável) */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-center">
            <div className="text-lg font-semibold">{counters.reviews}</div>
            <div className="text-[11px] text-slate-400">Reviews</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-center">
            <div className="text-lg font-semibold">{counters.followers}</div>
            <div className="text-[11px] text-slate-400">Followers</div>
          </div>
        </div>

        {/* Follow/Following (não move layout) */}
        {!isMe && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleFollow}
              className={`px-3 py-2 rounded w-full ${
                following ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </section>

      {/* RIGHT: Reviews section (separada) */}
      <section className="md:col-span-2 space-y-3">
        <div className="rounded-2xl border border-slate-800 bg-sky-950 p-4">
          <h2 className="font-semibold">Reviews</h2>
        </div>
        {reviews.length === 0 && (
          <p className="text-sm text-slate-400">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 border rounded bg-sky-950"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
