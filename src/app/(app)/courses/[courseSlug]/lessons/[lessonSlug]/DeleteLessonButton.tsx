"use client";

import { deleteLesson } from "../actions";

export function DeleteLessonButton({ courseSlug, lessonId }: { courseSlug: string; lessonId: string }) {
  return (
    <form
      action={deleteLesson.bind(null, courseSlug, lessonId)}
      onSubmit={(e) => {
        if (!confirm("Удалить этот урок вместе с домашкой и всеми сдачами?")) e.preventDefault();
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
