"use client";
import Image from "next/image";

type Book = { id: string; title: string; author?: string | null; cover_url?: string | null };

export function BookCard({ book, onSelect }: { book: Book; onSelect?: (b: Book) => void }) {
  return (
    <button
      onClick={() => onSelect?.(book)}
      className="
        group flex items-center gap-4 rounded-xl border border-slate-800
        bg-sky-950/90 p-3 sm:p-4 shadow-sm hover:shadow-md transition
        text-left
      "
    >
      {/* Capa maior */}
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

      {/* Conteúdo compacto */}
      <div className="min-w-0">
        <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2">
          {book.title}
        </h3>
        {book.author && (
          <p className="mt-1 text-sm text-slate-300/80 line-clamp-1">{book.author}</p>
        )}
        {/* Call to action sutil ao passar o mouse */}
        {onSelect && (
          <p className="mt-2 text-xs text-sky-200/80 opacity-0 group-hover:opacity-100 transition">
            Click to review
          </p>
        )}
      </div>
    </button>
  );
}
