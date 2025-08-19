type Book = { id: string; title: string; authors?: string | null; cover_url?: string | null };

export function BookCard({ book, onSelect }: { book: Book; onSelect?: (b: Book) => void }) {
  return (
    <button
      onClick={() => onSelect?.(book)}
      className="bg-sky-950 rounded-xl p-4 shadow-sm border text-left hover:shadow transition flex gap-4"
    >
      {book.cover_url && <img src={book.cover_url} alt={book.title} className="w-16 h-24 object-cover rounded" />}
      <div>
        <h3 className="font-semibold">{book.title}</h3>
        {book.authors && <p className="text-sm text-slate-600">{book.authors}</p>}
      </div>
    </button>
  );
}
