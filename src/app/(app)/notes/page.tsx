import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CARD_ACCENTS = ["border-pink/40", "border-teal/40", "border-yellow/50", "border-primary-soft"];

export default async function NotesPage() {
  const session = await getSession();
  const notes = await prisma.note.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-ink">📚 Конспекты</h1>
        {session.role === "teacher" && (
          <Link
            href="/notes/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark"
          >
            + Новый конспект
          </Link>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-8 text-center text-ink-soft">
          Пока нет ни одного конспекта. 🌱
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {notes.map((note, i) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.slug}`}
                className={`wiggle-hover flex h-full items-center gap-3 rounded-3xl border-2 bg-white p-5 shadow-sm transition ${
                  CARD_ACCENTS[i % CARD_ACCENTS.length]
                }`}
              >
                <span className="text-2xl">📖</span>
                <span className="font-heading font-bold text-ink">{note.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
