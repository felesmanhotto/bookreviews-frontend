"use client";

import Image from "next/image";
import Link from "next/link";
import LikeButton from "./LikeButton";

type Book = { id: string; title: string; authors?: string | null; cover_url?: string | null };
type Review = { id: number; content: string; rating: number; user_id: number; book: Book };

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

export default function ReviewCard({ review }: { review: Review }) {
  const { book } = review;

  return (
    <article className="rounded-2xl border border-slate-800 bg-sky-950 shadow-sm transition hover:shadow-md">
      <div className="flex items-stretch gap-5 p-4 md:p-5">
        {/* capa */}
        <div className="relative w-28 md:w-36 shrink-0 rounded-lg overflow-hidden bg-slate-800 min-h-[168px] md:min-h-[192px]">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 112px, 144px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">
              No cover
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* header: título/autor + info do usuário */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg md:text-2xl font-semibold leading-tight truncate">
                <Link href={`/books/${book.id}`} className="hover:underline">
                  {book.title}
                </Link>
              </h3>
              {book.authors && (
                <p className="text-sm text-slate-400 truncate">{book.authors}</p>
              )}
              <div className="mt-2 md:mt-3">
                <StarRating value={review.rating} size={20} />
              </div>
            </div>

            {/* info do autor da review */}
            <aside className="hidden md:block text-right text-xs text-slate-400 shrink-0">
              by <span className="font-medium text-slate-200">User #{review.user_id}</span>
            </aside>
          </div>

          {/* conteúdo da review */}
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-200/90 line-clamp-4 flex-1">
            {review.content}
          </p>

          {/* footer: like no canto inferior direito */}
          <div className="mt-4 flex justify-end">
            <LikeButton reviewId={review.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
