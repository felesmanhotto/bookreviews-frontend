export type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };
export type Review = { id: number; content: string; rating: number; user_id: number; book: Book };
export type Comment = { id: number; content: string; user_id: number; user_name: string; created_at?: string };
export type User = { id: number; name: string; email: string; bio?: string|null; created_at: string };
export type UserCounters = { followers: number, reviews: number };