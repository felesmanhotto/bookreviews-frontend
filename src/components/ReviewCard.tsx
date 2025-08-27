"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import LikeButton from "./LikeButton";
import { Book, Review } from "@/types";

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="inline-block">
      <path
        className={filled ? "fill-amber-400" : "fill-slate-500/30"}
        d="M10 15.27 16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
      />
    </svg>
  );
}

function StarRating({
  value,
  size = 20,
  showText = true,
}: {
  value: number;
  size?: number;
  showText?: boolean;
}) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${v} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < v} size={size} />
      ))}
      {showText && <span className="ml-2 text-xs md:text-sm text-slate-400">{v}/5</span>}
    </div>
  );
}

export default function ReviewCard({ review: initial }: { review: Review }) {
  const { user, token } = useAuth();
  const [review, setReview] = useState<Review>(initial);
  const [busy, setBusy] = useState(false);
  const isOwner = user?.id === review.user_id;

  async function onEdit() {
    if (!token) return alert("Login required");
    const newContent = prompt("Edit content:", review.content);
    if (newContent === null) return; // cancelado
    const newRatingStr = prompt("Edit rating (1..5):", String(review.rating));
    if (newRatingStr === null) return;
    const newRating = Math.min(5, Math.max(1, parseInt(newRatingStr, 10) || review.rating));

    setBusy(true);
    try {
      const updated = await apiFetch<Review>(
        `/reviews/${review.id}`,
        { method: "PUT", body: JSON.stringify({ content: newContent, rating: newRating }) },
        token
      );
      setReview(updated);
    } catch (e: any) {
      alert(e.message || "Failed to update review");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!token) return alert("Login required");
    if (!confirm("Delete this review? This cannot be undone.")) return;

    setBusy(true);
    try {
      await apiFetch(`/reviews/${review.id}`, { method: "DELETE" }, token);
      // UX simples: marca como deletada localmente (o ideal é o pai remover da lista)
      setReview({ ...review, content: "[deleted]" });
    } catch (e: any) {
      alert(e.message || "Failed to delete review");
    } finally {
      setBusy(false);
    }
  }

  const { book } = review;

  return (
    <article className={`rounded-2xl border border-slate-800 bg-sky-950 shadow-sm transition hover:shadow-md ${busy ? "opacity-75" : ""}`}>
      <div className="flex items-stretch gap-5 p-4 md:p-5">
        {/* capa */}
        <div className="relative w-28 md:w-36 shrink-0 rounded-lg overflow-hidden bg-slate-800 min-h-[168px] md:min-h-[192px]">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 112px, 144px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">No cover</div>
          )}
        </div>

        {/* coluna direita */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* header: título/autor + ações do dono */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg md:text-2xl font-semibold leading-tight truncate">
                <Link href={`/books/${book.id}`} className="hover:underline">{book.title}</Link>
              </h3>
              {book.authors && <p className="text-sm text-slate-400 truncate">{book.authors}</p>}
              <div className="mt-2 md:mt-3">
                <StarRating value={review.rating} size={20} />
              </div>
            </div>

            {/* ações do dono (edit/delete) */}
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={onEdit}
                  disabled={busy}
                  className="rounded-lg border border-slate-600 bg-slate-100 text-slate-900 text-xs px-2 py-1 hover:bg-white disabled:opacity-50"
                  title="Edit review"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  disabled={busy}
                  className="rounded-lg border border-red-500/40 bg-red-600/10 text-red-300 text-xs px-2 py-1 hover:bg-red-600/20 disabled:opacity-50"
                  title="Delete review"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* conteúdo */}
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-200/90 line-clamp-4 flex-1">
            {review.content}
          </p>

          {/* footer: like no canto inferior direito */}
          <div className="mt-4 flex items-center justify-between">
            <a
              href={`/reviews/${review.id}`}
              className="text-xs underline text-slate-300 hover:text-white"
            >
              Comments
            </a>
            <LikeButton reviewId={review.id} />
          </div>
        </div>
      </div>
    </article>
  );
}