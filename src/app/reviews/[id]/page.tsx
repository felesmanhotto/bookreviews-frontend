"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import { Book, Review } from "@/types";

export default function ReviewDetailPage() {
    const params = useParams<{ id: string }>();
    const reviewId = Number(params.id); // converte string → número
    const [review, setReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
  
    async function fetchReview() {
      setLoading(true);
      try {
        const r = await apiFetch<Review>(`/reviews/${reviewId}`);
        setReview(r);
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      fetchReview();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId]);
  
    if (loading) return <p>Loading…</p>;
    if (!review) return <p>Review not found.</p>;

    return (
        <div className="space-y-5">
          <ReviewCard review={review} />
    
          <section className="rounded-2xl border border-slate-800 bg-sky-950 p-4 md:p-5">
            <h2 className="mb-3 text-lg font-semibold">Comments</h2>
            <CommentForm
              reviewId={review.id}
              onCreated={() => {
                // opcional: poderíamos forçar o CommentList a recarregar via um estado-latch
                // por simplicidade, apenas deixe o usuário clicar "Load more" ou recarregar
              }}
            />
            <div className="mt-4">
              <CommentList reviewId={review.id} />
            </div>
          </section>
        </div>
      );
    }