import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/lib/books";

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "A collection of books I have read.",
};

function BookCard({ book }: { book: (typeof books)[number] }) {
  return (
    <article className="relative flex aspect-square min-w-0 flex-col rounded-[8px] border border-[#F3F3F3] bg-[#F7F7F7] p-4">
      <div className="absolute inset-x-4 top-[20%] flex h-[60%] items-center justify-center">
        <Image
          src={book.image}
          alt={`Cover of ${book.title}`}
          width={192}
          height={192}
          unoptimized
          className="h-full w-auto max-w-full object-contain"
        />
      </div>
      <div className="relative mt-auto flex items-end gap-2 pt-3 text-sm leading-5 tracking-[-0.15px]">
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <h2 className="text-[#09090B]">{book.title}</h2>
          <p className="text-[#9F9FA9]">{book.author}</p>
        </div>
      </div>
    </article>
  );
}

export default function BookshelfPage() {
  return (
    <main className="min-h-screen bg-white px-4 pt-4 pb-4 font-mono text-neutral-900">
      <div className="w-full">
        <header className="mb-8">
          <h1 className="text-xl font-bold">Bookshelf</h1>
          <p className="mt-1 text-sm text-neutral-500">A collection of books I have read.</p>
        </header>
        {books.length > 0 ? (
          <ul className="grid grid-cols-1 gap-[6px] sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <li key={`${book.title}-${book.author}`} className="min-w-0">
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">The shelf is waiting for its first book.</p>
        )}
      </div>
    </main>
  );
}
