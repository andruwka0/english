"use client";

import { useActionState, useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TASK_KIND_LABELS, type TaskData, type TaskDraft, type TaskKindValue } from "@/lib/tasks";
import { TaskEditor } from "./TaskEditor";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputCls =
  "w-full rounded-2xl border-2 border-primary-soft px-4 py-2.5 text-sm outline-none focus:border-primary";
const labelCls = "block text-sm font-bold text-ink";

const DEFAULT_CODE_TEST = `# Пример: ученица просто печатает что-то через print(),
# без функций — вся её печать доступна в переменной output.
assert output.strip() == "Привет, мир!", "Должно быть напечатано: Привет, мир!"
print("✅ Отлично, всё верно!")
`;

function defaultTaskData(kind: TaskKindValue): TaskData {
  switch (kind) {
    case "CODE":
      return { kind: "CODE", starterCode: "", testCode: DEFAULT_CODE_TEST };
    case "MATCHING":
      return { kind: "MATCHING", pairs: [{ term: "", translation: "" }] };
    case "FILL_BLANK":
      return { kind: "FILL_BLANK", sentence: "", options: ["", ""], correctOption: "" };
    case "MULTIPLE_CHOICE":
      return { kind: "MULTIPLE_CHOICE", question: "", options: ["", ""], correctIndex: 0 };
  }
}

function newTask(kind: TaskKindValue): TaskDraft {
  return {
    localId: Math.random().toString(36).slice(2),
    kind,
    title: "",
    prompt: "",
    maxAttempts: null,
    data: defaultTaskData(kind),
  };
}

export function LessonForm({
  action,
  submitLabel,
  allowedKinds,
  initialTitle = "",
  initialContent = "",
  initialDeadline = null,
  initialTasks = [],
}: {
  action: FormAction;
  submitLabel: string;
  allowedKinds: TaskKindValue[];
  initialTitle?: string;
  initialContent?: string;
  initialDeadline?: string | null;
  initialTasks?: TaskDraft[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [content, setContent] = useState(initialContent);
  const [deadlineEnabled, setDeadlineEnabled] = useState(!!initialDeadline);
  const [deadline, setDeadline] = useState(initialDeadline ?? "");
  const [tasks, setTasks] = useState<TaskDraft[]>(initialTasks);

  function addTask(kind: TaskKindValue) {
    setTasks((ts) => [...ts, newTask(kind)]);
  }
  function updateTask(i: number, t: TaskDraft) {
    setTasks((ts) => ts.map((old, j) => (j === i ? t : old)));
  }
  function removeTask(i: number) {
    setTasks((ts) => ts.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setTasks((ts) => {
      const copy = [...ts];
      const j = i + dir;
      if (j < 0 || j >= copy.length) return ts;
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  const tasksJson = JSON.stringify(
    tasks.map(({ localId, ...rest }) => {
      void localId;
      return rest;
    }),
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border-2 border-primary-soft bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <label htmlFor="title" className={labelCls}>
          Заголовок урока
        </label>
        <input id="title" name="title" defaultValue={initialTitle} required className={inputCls} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="content" className={labelCls}>
            Конспект (Markdown)
          </label>
          <textarea
            id="content"
            name="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
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

      <div className="space-y-2 rounded-2xl border-2 border-primary-soft p-4">
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            name="deadlineEnabled"
            checked={deadlineEnabled}
            onChange={(e) => setDeadlineEnabled(e.target.checked)}
          />
          📅 Установить дедлайн для домашки (необязательно, только для информации)
        </label>
        {deadlineEnabled && (
          <input
            type="date"
            name="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${inputCls} max-w-56`}
          />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-lg font-bold text-ink">📝 Задания домашки</h3>
        {tasks.map((t, i) => (
          <TaskEditor
            key={t.localId}
            task={t}
            index={i}
            onChange={(nt) => updateTask(i, nt)}
            onRemove={() => removeTask(i)}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
            canMoveUp={i > 0}
            canMoveDown={i < tasks.length - 1}
          />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-xl border-2 border-dashed border-primary-soft p-4 text-center text-sm text-ink-soft">
            Заданий пока нет — урок будет только с конспектом, без домашки. Можно добавить ниже.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {allowedKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => addTask(kind)}
              className="rounded-full border-2 border-primary-soft px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary-soft"
            >
              + {TASK_KIND_LABELS[kind].emoji} {TASK_KIND_LABELS[kind].label}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="tasksJson" value={tasksJson} />

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
