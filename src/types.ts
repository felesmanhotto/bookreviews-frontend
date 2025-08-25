export type Book = { id: string; title: string; authors?: string|null; cover_url?: string|null };
export type Review = { id: number; content: string; rating: number; user_id: number; book: Book };
export type Comment = { id: number; content: string; user_id: number; created_at?: string };
