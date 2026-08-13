// Shape of Task.data / Submission.answer (Prisma stores these as untyped Json).
// Each variant is tagged with `kind` matching the TaskKind enum so a single
// switch on `task.kind` is enough to narrow both the task data and the
// student's answer to the right shape.

export type TaskData =
  | { kind: "CODE"; starterCode: string; testCode: string }
  | { kind: "MATCHING"; pairs: { term: string; translation: string }[] }
  | { kind: "FILL_BLANK"; sentence: string; options: string[]; correctOption: string }
  | { kind: "MULTIPLE_CHOICE"; question: string; options: string[]; correctIndex: number };

export type AnswerData =
  | { kind: "MATCHING"; given: { term: string; translation: string }[] }
  | { kind: "FILL_BLANK"; chosenOption: string }
  | { kind: "MULTIPLE_CHOICE"; chosenIndex: number };

export const TASK_KINDS = ["CODE", "MATCHING", "FILL_BLANK", "MULTIPLE_CHOICE"] as const;
export type TaskKindValue = (typeof TASK_KINDS)[number];

export const TASK_KIND_LABELS: Record<TaskKindValue, { emoji: string; label: string }> = {
  CODE: { emoji: "💻", label: "Код" },
  MATCHING: { emoji: "🔗", label: "Сопоставление" },
  FILL_BLANK: { emoji: "✏️", label: "Пропуск в предложении" },
  MULTIPLE_CHOICE: { emoji: "☑️", label: "Варианты ответа" },
};

export interface TaskDraft {
  localId: string;
  dbId?: string;
  kind: TaskKindValue;
  title: string;
  prompt: string;
  maxAttempts: number | null;
  data: TaskData;
}

/** Validates one parsed task draft. Returns an error message, or null if valid. */
export function validateTaskDraft(t: unknown, index: number): string | null {
  const n = index + 1;
  if (typeof t !== "object" || t === null) return `Задание ${n}: некорректные данные`;
  const task = t as Record<string, unknown>;

  if (!TASK_KINDS.includes(task.kind as TaskKindValue)) {
    return `Задание ${n}: неизвестный тип`;
  }
  if (typeof task.title !== "string" || !task.title.trim()) {
    return `Задание ${n}: заполни заголовок`;
  }
  if (typeof task.prompt !== "string" || !task.prompt.trim()) {
    return `Задание ${n}: заполни условие`;
  }
  if (task.maxAttempts !== null && !(Number.isInteger(task.maxAttempts) && (task.maxAttempts as number) > 0)) {
    return `Задание ${n}: лимит попыток должен быть пустым или целым числом больше 0`;
  }

  const data = task.data as Record<string, unknown> | undefined;
  if (typeof data !== "object" || data === null) return `Задание ${n}: нет данных задания`;

  switch (task.kind as TaskKindValue) {
    case "CODE":
      if (typeof data.starterCode !== "string") return `Задание ${n}: нет начального кода`;
      if (typeof data.testCode !== "string" || !data.testCode.trim()) {
        return `Задание ${n}: нужен тест`;
      }
      return null;
    case "MATCHING": {
      const pairs = data.pairs;
      if (!Array.isArray(pairs) || pairs.length < 1) return `Задание ${n}: добавь хотя бы одну пару`;
      for (const p of pairs) {
        if (!p || typeof p.term !== "string" || !p.term.trim() || typeof p.translation !== "string" || !p.translation.trim()) {
          return `Задание ${n}: заполни все пары полностью`;
        }
      }
      return null;
    }
    case "FILL_BLANK": {
      if (typeof data.sentence !== "string" || !data.sentence.includes("___")) {
        return `Задание ${n}: в предложении должен быть пропуск, обозначенный как ___`;
      }
      const options = data.options;
      if (!Array.isArray(options) || options.length < 2) return `Задание ${n}: добавь минимум 2 варианта`;
      if (options.some((o) => typeof o !== "string" || !o.trim())) {
        return `Задание ${n}: заполни все варианты`;
      }
      if (typeof data.correctOption !== "string" || !options.includes(data.correctOption)) {
        return `Задание ${n}: выбери правильный вариант`;
      }
      return null;
    }
    case "MULTIPLE_CHOICE": {
      if (typeof data.question !== "string" || !data.question.trim()) {
        return `Задание ${n}: заполни вопрос`;
      }
      const options = data.options;
      if (!Array.isArray(options) || options.length < 2) return `Задание ${n}: добавь минимум 2 варианта`;
      if (options.some((o) => typeof o !== "string" || !o.trim())) {
        return `Задание ${n}: заполни все варианты`;
      }
      if (
        typeof data.correctIndex !== "number" ||
        !Number.isInteger(data.correctIndex) ||
        data.correctIndex < 0 ||
        data.correctIndex >= options.length
      ) {
        return `Задание ${n}: выбери правильный вариант`;
      }
      return null;
    }
  }
}
