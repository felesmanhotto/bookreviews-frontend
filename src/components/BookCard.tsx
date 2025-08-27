"use client";
import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types";

type Props = {
  book: Book;
  onReview?: (b: Book) => void; // chama modal de review
};

export function BookCard({ book, onReview }: Props) {
  return (
    <div
      className="
        group flex items-center gap-4 rounded-xl border border-slate-800
        bg-sky-950/90 p-3 sm:p-4 shadow-sm hover:shadow-md transition
      "
    >
      {/* cover */}
      <div className="relative w-24 sm:w-30 md:w-36 aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 shrink-0">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 96px, (max-width: 768px) 120px, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">
            No cover
          </div>
        )}
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2">
          {book.title}
        </h3>
        {book.authors && (
          <p className="mt-1 text-sm text-slate-300/80 line-clamp-1">{book.authors}</p>
        )}

        {/* actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReview?.(book)}
            className="rounded-lg border border-slate-600 bg-slate-100 text-slate-900 text-xs px-3 py-1 hover:bg-white disabled:opacity-50"
            aria-label={`Write a review for ${book.title}`}
          >
            Review
          </button>
          <Link
            href={`/books/${book.id}`}
            className="rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs px-3 py-1 hover:bg-slate-800"
            aria-label={`Open details for ${book.title}`}
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
