import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";

type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };
type Review = { id: number; content: string; rating: number; user_id: number; book: Book };

export default async function HomePage() {
  const reviews = await apiFetch<Review[]>("/reviews/feed?limit=20");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-2">Recent reviews</h1>
      {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map(r => <ReviewCard key={r.id} review={r} />)}
    </div>
  );
}
