"use client";

import { useActionState, useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputCls =
  "w-full rounded-2xl border-2 border-primary-soft px-4 py-2.5 text-sm outline-none focus:border-primary";
const labelCls = "block text-sm font-bold text-ink";

export function NoteForm({
  action,
  submitLabel,
  initialTitle = "",
  initialContent = "",
}: {
  action: FormAction;
  submitLabel: string;
  initialTitle?: string;
  initialContent?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [content, setContent] = useState(initialContent);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border-2 border-primary-soft bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <label htmlFor="title" className={labelCls}>
          Заголовок
        </label>
        <input id="title" name="title" defaultValue={initialTitle} required className={inputCls} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="content" className={labelCls}>
            Содержимое (Markdown, ``` для кода)
          </label>
          <textarea
            id="content"
            name="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div className="space-y-1">
          <span className={labelCls}>Превью</span>
          <div className="h-[calc(100%-1.5rem)] overflow-auto rounded-2xl border-2 border-primary-soft bg-cream p-4">
            <MarkdownRenderer content={content || "*Ничего не введено*"} />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger" role="alert">
          😅 {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100"
      >
        {pending ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
