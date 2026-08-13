"use client";

import { useActionState } from "react";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputCls =
  "w-full rounded-2xl border-2 border-primary-soft px-3 py-2 text-sm outline-none focus:border-primary";

export function WordForm({
  action,
  submitLabel,
  initialTerm = "",
  initialTranslation = "",
  initialExample = "",
  onCancel,
}: {
  action: FormAction;
  submitLabel: string;
  initialTerm?: string;
  initialTranslation?: string;
  initialExample?: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
      <input name="term" defaultValue={initialTerm} placeholder="слово (English)" required className={inputCls} />
      <input
        name="translation"
        defaultValue={initialTranslation}
        placeholder="перевод"
        required
        className={inputCls}
      />
      <input
        name="example"
        defaultValue={initialExample}
        placeholder="пример (необязательно)"
        className={inputCls}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark disabled:opacity-50"
        >
          {pending ? "..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-2 text-sm font-bold text-ink-soft hover:bg-primary-soft"
          >
            Отмена
          </button>
        )}
      </div>
      {state?.error && (
        <p className="sm:col-span-4 rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          😅 {state.error}
        </p>
      )}
    </form>
  );
}
