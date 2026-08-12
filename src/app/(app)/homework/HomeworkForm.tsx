"use client";

import { useActionState, useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CodeEditor } from "@/components/CodeEditor";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const DEFAULT_TEST_TEMPLATE = `# Пример: ученица просто печатает что-то через print(),
# без функций — вся её печать доступна в переменной output.
assert output.strip() == "Привет, мир!", "Должно быть напечатано: Привет, мир!"
print("✅ Отлично, всё верно!")
`;

const inputCls =
  "w-full rounded-2xl border-2 border-primary-soft px-4 py-2.5 text-sm outline-none focus:border-primary";
const labelCls = "block text-sm font-bold text-ink";

export function HomeworkForm({
  action,
  submitLabel,
  initialTitle = "",
  initialDescription = "",
  initialStarterCode = "",
  initialTestCode = DEFAULT_TEST_TEMPLATE,
  initialMaxAttempts = null,
}: {
  action: FormAction;
  submitLabel: string;
  initialTitle?: string;
  initialDescription?: string;
  initialStarterCode?: string;
  initialTestCode?: string;
  initialMaxAttempts?: number | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [description, setDescription] = useState(initialDescription);
  const [starterCode, setStarterCode] = useState(initialStarterCode);
  const [testCode, setTestCode] = useState(initialTestCode);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border-2 border-primary-soft bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <label htmlFor="title" className={labelCls}>
          Заголовок
        </label>
        <input id="title" name="title" defaultValue={initialTitle} required className={inputCls} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="description" className={labelCls}>
            Условие (Markdown)
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div className="space-y-1">
          <span className={labelCls}>Превью</span>
          <div className="h-[calc(100%-1.5rem)] overflow-auto rounded-2xl border-2 border-primary-soft bg-cream p-4">
            <MarkdownRenderer content={description || "*Ничего не введено*"} />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="maxAttempts" className={labelCls}>
          🎯 Лимит попыток на сдачу (необязательно)
        </label>
        <input
          id="maxAttempts"
          name="maxAttempts"
          type="number"
          min={1}
          step={1}
          defaultValue={initialMaxAttempts ?? ""}
          placeholder="без ограничений"
          className={`${inputCls} max-w-40`}
        />
        <p className="text-xs text-ink-soft">
          Ограничивает только кнопку «Сдать» — тренироваться и жать «Запустить» можно сколько
          угодно раз. Оставь пустым, если ограничение не нужно.
        </p>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Начальный код (то, что увидит ученица)</label>
        <CodeEditor value={starterCode} onChange={setStarterCode} height="160px" />
        <input type="hidden" name="starterCode" value={starterCode} />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>
          Тест (Python, {"assert"} + финальный {"print"} с сообщением об успехе)
        </label>
        <CodeEditor value={testCode} onChange={setTestCode} height="200px" />
        <input type="hidden" name="testCode" value={testCode} />
        <p className="text-xs text-ink-soft">
          Всё, что код ученицы напечатает через {"print()"}, доступно тесту в переменной{" "}
          <code>output</code> (обычная строка) — этого достаточно, если задание не требует
          писать функции ({"def"}). Также доступны все переменные, которые она создала.
          Используй {"assert"} с понятным сообщением, последняя строка теста — обычно{" "}
          {"print(\"✅ ...\")"}.
        </p>
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
