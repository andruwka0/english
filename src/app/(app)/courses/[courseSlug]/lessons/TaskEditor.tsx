"use client";

import { CodeEditor } from "@/components/CodeEditor";
import { TASK_KIND_LABELS, type TaskData, type TaskDraft } from "@/lib/tasks";

const inputCls =
  "w-full rounded-2xl border-2 border-primary-soft px-3 py-2 text-sm outline-none focus:border-primary";
const labelCls = "block text-xs font-bold text-ink-soft";

function updateData<K extends TaskData["kind"]>(
  task: TaskDraft,
  patch: Partial<Extract<TaskData, { kind: K }>>,
): TaskData {
  return { ...task.data, ...patch } as TaskData;
}

export function TaskEditor({
  task,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  task: TaskDraft;
  index: number;
  onChange: (task: TaskDraft) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const kindInfo = TASK_KIND_LABELS[task.kind];

  return (
    <div className="space-y-3 rounded-2xl border-2 border-primary-soft bg-cream p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          {kindInfo.emoji} Задание {index + 1} · {kindInfo.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-primary-soft disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-primary-soft disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full px-2 py-1 text-danger hover:bg-danger-soft"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className={labelCls}>Заголовок задания</label>
          <input
            className={inputCls}
            value={task.title}
            onChange={(e) => onChange({ ...task, title: e.target.value })}
            placeholder={`Задание ${index + 1}`}
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Лимит попыток на сдачу (необязательно)</label>
          <input
            type="number"
            min={1}
            step={1}
            className={inputCls}
            value={task.maxAttempts ?? ""}
            placeholder="без ограничений"
            onChange={(e) =>
              onChange({ ...task, maxAttempts: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Условие</label>
        <textarea
          className={`${inputCls} font-mono`}
          rows={3}
          value={task.prompt}
          onChange={(e) => onChange({ ...task, prompt: e.target.value })}
        />
      </div>

      {task.data.kind === "CODE" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelCls}>Начальный код</label>
            <CodeEditor
              value={task.data.starterCode}
              onChange={(v) => onChange({ ...task, data: updateData<"CODE">(task, { starterCode: v }) })}
              height="120px"
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>
              Тест ({"assert"} по переменной {"output"} или по функциям/переменным ученицы)
            </label>
            <CodeEditor
              value={task.data.testCode}
              onChange={(v) => onChange({ ...task, data: updateData<"CODE">(task, { testCode: v }) })}
              height="160px"
            />
          </div>
        </div>
      )}

      {task.data.kind === "MATCHING" && (
        <div className="space-y-2">
          <label className={labelCls}>Пары «слово → перевод»</label>
          {task.data.pairs.map((pair, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputCls}
                placeholder="слово"
                value={pair.term}
                onChange={(e) => {
                  const pairs = task.data.kind === "MATCHING" ? [...task.data.pairs] : [];
                  pairs[i] = { ...pairs[i], term: e.target.value };
                  onChange({ ...task, data: updateData<"MATCHING">(task, { pairs }) });
                }}
              />
              <input
                className={inputCls}
                placeholder="перевод"
                value={pair.translation}
                onChange={(e) => {
                  const pairs = task.data.kind === "MATCHING" ? [...task.data.pairs] : [];
                  pairs[i] = { ...pairs[i], translation: e.target.value };
                  onChange({ ...task, data: updateData<"MATCHING">(task, { pairs }) });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const pairs = task.data.kind === "MATCHING" ? task.data.pairs.filter((_, j) => j !== i) : [];
                  onChange({ ...task, data: updateData<"MATCHING">(task, { pairs }) });
                }}
                className="rounded-full px-3 text-danger hover:bg-danger-soft"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const pairs = task.data.kind === "MATCHING" ? [...task.data.pairs, { term: "", translation: "" }] : [];
              onChange({ ...task, data: updateData<"MATCHING">(task, { pairs }) });
            }}
            className="rounded-full border-2 border-primary-soft px-3 py-1 text-xs font-bold text-primary hover:bg-primary-soft"
          >
            + пара
          </button>
        </div>
      )}

      {task.data.kind === "FILL_BLANK" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className={labelCls}>Предложение (пропуск обозначь как ___)</label>
            <input
              className={inputCls}
              value={task.data.sentence}
              placeholder="I ___ to school every day."
              onChange={(e) => onChange({ ...task, data: updateData<"FILL_BLANK">(task, { sentence: e.target.value }) })}
            />
          </div>
          <label className={labelCls}>Варианты (отметь правильный)</label>
          {task.data.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${task.localId}`}
                checked={task.data.kind === "FILL_BLANK" && task.data.correctOption === opt && opt !== ""}
                onChange={() => onChange({ ...task, data: updateData<"FILL_BLANK">(task, { correctOption: opt }) })}
              />
              <input
                className={inputCls}
                value={opt}
                onChange={(e) => {
                  if (task.data.kind !== "FILL_BLANK") return;
                  const options = [...task.data.options];
                  const wasCorrect = task.data.correctOption === options[i];
                  options[i] = e.target.value;
                  onChange({
                    ...task,
                    data: updateData<"FILL_BLANK">(task, {
                      options,
                      correctOption: wasCorrect ? e.target.value : task.data.correctOption,
                    }),
                  });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (task.data.kind !== "FILL_BLANK") return;
                  const options = task.data.options.filter((_, j) => j !== i);
                  onChange({ ...task, data: updateData<"FILL_BLANK">(task, { options }) });
                }}
                className="rounded-full px-3 text-danger hover:bg-danger-soft"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              if (task.data.kind !== "FILL_BLANK") return;
              onChange({ ...task, data: updateData<"FILL_BLANK">(task, { options: [...task.data.options, ""] }) });
            }}
            className="rounded-full border-2 border-primary-soft px-3 py-1 text-xs font-bold text-primary hover:bg-primary-soft"
          >
            + вариант
          </button>
        </div>
      )}

      {task.data.kind === "MULTIPLE_CHOICE" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className={labelCls}>Вопрос</label>
            <input
              className={inputCls}
              value={task.data.question}
              onChange={(e) => onChange({ ...task, data: updateData<"MULTIPLE_CHOICE">(task, { question: e.target.value }) })}
            />
          </div>
          <label className={labelCls}>Варианты (отметь правильный)</label>
          {task.data.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`mc-correct-${task.localId}`}
                checked={task.data.kind === "MULTIPLE_CHOICE" && task.data.correctIndex === i}
                onChange={() => onChange({ ...task, data: updateData<"MULTIPLE_CHOICE">(task, { correctIndex: i }) })}
              />
              <input
                className={inputCls}
                value={opt}
                onChange={(e) => {
                  if (task.data.kind !== "MULTIPLE_CHOICE") return;
                  const options = [...task.data.options];
                  options[i] = e.target.value;
                  onChange({ ...task, data: updateData<"MULTIPLE_CHOICE">(task, { options }) });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (task.data.kind !== "MULTIPLE_CHOICE") return;
                  const options = task.data.options.filter((_, j) => j !== i);
                  const correctIndex = task.data.correctIndex >= options.length ? 0 : task.data.correctIndex;
                  onChange({ ...task, data: updateData<"MULTIPLE_CHOICE">(task, { options, correctIndex }) });
                }}
                className="rounded-full px-3 text-danger hover:bg-danger-soft"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              if (task.data.kind !== "MULTIPLE_CHOICE") return;
              onChange({ ...task, data: updateData<"MULTIPLE_CHOICE">(task, { options: [...task.data.options, ""] }) });
            }}
            className="rounded-full border-2 border-primary-soft px-3 py-1 text-xs font-bold text-primary hover:bg-primary-soft"
          >
            + вариант
          </button>
        </div>
      )}
    </div>
  );
}
