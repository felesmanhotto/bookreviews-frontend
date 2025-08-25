"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Comment } from "@/types";

export default function CommentForm({
  reviewId,
  onCreated,
}: {
  reviewId: number;
  onCreated?: (content: string) => void;
}) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      alert("Login required to comment.");
      return;
    }
    if (!content.trim()) return;
    setLoading(true);
    try {
      const created = await apiFetch<Comment>(`/comments/review/${reviewId}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }, token);
      setContent("");
      onCreated?.(created.content);
    } catch (e: any) {
      alert(e.message || "Failed to create comment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Write a comment…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        disabled={loading}
        className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900 hover:bg-white disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
