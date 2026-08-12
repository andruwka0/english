"use client";

import { deleteHomework } from "../actions";

export function DeleteHomeworkButton({ id }: { id: string }) {
  return (
    <form
      action={deleteHomework.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Удалить эту домашку вместе со всеми сдачами?")) e.preventDefault();
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
