import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWord } from "./actions";
import { WordForm } from "./WordForm";
import { WordCard } from "./WordCard";

export default async function VocabularyPage() {
  const [session, words] = await Promise.all([
    getSession(),
    prisma.word.findMany({ orderBy: { order: "asc" } }),
  ]);

  const isTeacher = session.role === "teacher";

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-ink">📖 Словарик</h1>

      {isTeacher && (
        <div className="rounded-3xl border-2 border-primary-soft bg-white p-4">
          <WordForm key={words.length} action={createWord} submitLabel="+ Добавить слово" />
        </div>
      )}

      {words.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-8 text-center text-ink-soft">
          Пока нет ни одного слова. 🌱
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <WordCard key={word.id} word={word} isTeacher={isTeacher} />
          ))}
        </ul>
      )}
    </div>
  );
}
