"use client";

import { deleteNote } from "../actions";

export function DeleteNoteButton({ slug }: { slug: string }) {
  return (
    <form
      action={deleteNote.bind(null, slug)}
      onSubmit={(e) => {
        if (!confirm("Удалить этот конспект?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-full px-3 py-1.5 text-danger transition hover:bg-danger-soft"
      >
        Удалить
      </button>
    </form>
  );
}
