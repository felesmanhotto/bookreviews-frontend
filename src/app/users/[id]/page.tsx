import { apiFetch } from "@/lib/api";
import ReviewCard from "@/components/ReviewCard";

type User = { id: number; name: string; bio?: string|null; created_at: string };
type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };
type Review = { id: number; content: string; rating: number; user_id: number; book: Book };

export default async function UserProfilePage({ params, searchParams }: any) {
  const id = params.id as string;
  const limit = Number(searchParams.limit ?? 20);
  const offset = Number(searchParams.offset ?? 0);

  const [user, reviews] = await Promise.all([
    apiFetch<User>(`/users/${id}`),
    apiFetch<Review[]>(`/users/${id}/reviews?limit=${limit}&offset=${offset}`),
  ]);

  return (
    <div className="space-y-4">
      <section className="bg-sky-950 p-4 rounded-xl border shadow-sm">
        <h1 className="text-xl font-bold">{user.name}</h1>
        {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
        <p className="text-xs text-slate-500 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {reviews.length === 0 ? <p className="text-sm text-slate-600">No reviews yet.</p> : reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </section>
    </div>
  );
}
