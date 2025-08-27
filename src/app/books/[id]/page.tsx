"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import CreateReviewModal from "@/components/CreateReviewModal";
import { Book, Review } from "@/types";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const olid = params.id;

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const limit = 10;

  async function load(initial=false) {
    if (!initial && !hasMore) return;
    setLoading(true);
    try {
      // book detail (uses cache or fetches on backend)
      if (initial) {
        const b = await apiFetch<Book>(`/books/${olid}`);
        setBook(b);
      }
      const data = await apiFetch<Review[]>(`/reviews/book/${olid}?limit=${limit}&offset=${initial?0:offset}`);
      setReviews(prev => (initial ? data : [...prev, ...data]));
      setOffset(o => (initial ? data.length : o + data.length));
      setHasMore(data.length === limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    setReviews([]); setOffset(0); setHasMore(true);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [olid]);

  if (!book) return loading ? <p>Loading…</p> : <p>Book not found.</p>;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-sky-950 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{book.title}</h1>
            {book.authors && <p className="text-sm text-slate-400">{book.authors}</p>}
          </div>
          <button onClick={()=>setOpenModal(true)} className="px-3 py-2 rounded bg-slate-100 text-slate-900">
            Write a review
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {reviews.length === 0 && !loading && <p className="text-sm text-slate-400">No reviews yet.</p>}
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        {hasMore && (
          <div className="flex justify-center">
            <button onClick={()=>load()} disabled={loading} className="px-4 py-2 border rounded bg-sky-950">
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>

      <CreateReviewModal
        book={book}
        open={openModal}
        onClose={()=>setOpenModal(false)}
        onCreated={()=>{ setReviews([]); setOffset(0); setHasMore(true); load(true); }}
      />
    </div>
  );
}
