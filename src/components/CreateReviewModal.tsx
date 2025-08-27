"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/types";

export default function CreateReviewModal({
  book,
  open,
  onClose,
  onCreated,
}: {
  book: Book;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { alert("Login required"); return; }
    setBusy(true);
    try {
      await apiFetch(`/reviews`, {
        method: "POST",
        body: JSON.stringify({ book_id: book.id, content, rating }),
      }, token);
      setContent("");
      setRating(5);
      onCreated?.();
      onClose();
    } catch (e:any) {
      alert(e.message || "Failed to create review");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Review: {book.title}</h3>
            {book.authors && <p className="text-sm text-slate-400">{book.authors}</p>}
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <textarea
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm"
            rows={4}
            placeholder="Write your thoughts…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm">Rating</label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <span className="text-sm">{rating}/5</span>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border border-slate-600">
              Cancel
            </button>
            <button disabled={busy} className="px-3 py-2 rounded bg-slate-100 text-slate-900">
              {busy ? "Posting…" : "Post review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
