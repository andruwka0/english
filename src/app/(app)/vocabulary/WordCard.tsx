"use client";

import { useState } from "react";
import { updateWord, deleteWord } from "./actions";
import { WordForm } from "./WordForm";

export function WordCard({
  word,
  isTeacher,
}: {
  word: { id: string; term: string; translation: string; example: string | null };
  isTeacher: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-3xl border-2 border-primary-soft bg-white p-4">
        <WordForm
          action={updateWord.bind(null, word.id)}
          submitLabel="Сохранить"
          initialTerm={word.term}
          initialTranslation={word.translation}
          initialExample={word.example ?? ""}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="wiggle-hover flex w-full flex-col items-center gap-1 rounded-3xl border-2 border-primary-soft bg-white p-6 text-center shadow-sm transition"
      >
        <span className="font-heading text-xl font-bold text-ink">
          {flipped ? word.translation : word.term}
        </span>
        {flipped && word.example && <span className="text-xs italic text-ink-soft">{word.example}</span>}
        <span className="mt-1 text-xs text-ink-soft">{flipped ? "🔁 перевод" : "👆 нажми, чтобы увидеть перевод"}</span>
      </button>
      {isTeacher && (
        <div className="mt-1 flex justify-center gap-3 text-xs font-bold">
          <button onClick={() => setEditing(true)} className="text-ink-soft hover:text-primary">
            Редактировать
          </button>
          <form
            action={deleteWord.bind(null, word.id)}
            onSubmit={(e) => {
              if (!confirm(`Удалить слово «${word.term}»?`)) e.preventDefault();
            }}
          >
            <button type="submit" className="text-danger hover:underline">
              Удалить
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
