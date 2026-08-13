"use client";

import { useState, useTransition } from "react";
import { gradeMultipleChoice } from "@/lib/grading";
import type { TaskData } from "@/lib/tasks";
import { submitTask } from "@/app/(app)/courses/[courseSlug]/lessons/actions";
import { AttemptsInfo, LimitReachedBadge, ResultBox, primaryButtonCls, submitButtonCls } from "./shared";

export function MultipleChoiceTask({
  taskId,
  data,
  maxAttempts,
  attemptsUsed,
}: {
  taskId: string;
  data: Extract<TaskData, { kind: "MULTIPLE_CHOICE" }>;
  maxAttempts: number | null;
  attemptsUsed: number;
}) {
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [used, setUsed] = useState(attemptsUsed);
  const [result, setResult] = useState<{ passed: boolean } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const attemptsLeft = maxAttempts !== null ? Math.max(maxAttempts - used, 0) : null;
  const limitReached = attemptsLeft !== null && attemptsLeft <= 0;

  function pick(i: number) {
    setChosenIndex(i);
    setResult(null);
    setSubmitted(false);
  }

  function handleCheck() {
    if (chosenIndex === null) return;
    setResult({ passed: gradeMultipleChoice(data, chosenIndex) });
  }

  function handleSubmit() {
    if (!result || chosenIndex === null || limitReached) return;
    startTransition(async () => {
      const res = await submitTask(taskId, { kind: "MULTIPLE_CHOICE", chosenIndex });
      if (res.ok) {
        setUsed((n) => n + 1);
        setSubmitted(true);
        if (typeof res.passed === "boolean") setResult({ passed: res.passed });
      } else {
        setSubmitError(res.error ?? "Не получилось сдать");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="font-heading text-lg font-bold text-ink">{data.question}</p>

      <div className="space-y-2">
        {data.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pick(i)}
            className={`block w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${
              chosenIndex === i
                ? "border-primary bg-primary-soft text-primary"
                : "border-primary-soft text-ink hover:bg-primary-soft"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <AttemptsInfo maxAttempts={maxAttempts} used={used} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleCheck} disabled={chosenIndex === null} className={primaryButtonCls}>
          Проверить
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!result || isPending || limitReached}
          className={submitButtonCls}
        >
          {isPending ? "Отправка..." : submitted ? "Сдано ✓" : "Сдать"}
        </button>
        {limitReached && <LimitReachedBadge />}
      </div>

      {submitError && (
        <div className="rounded-2xl border-2 border-danger/30 bg-danger-soft p-4 text-sm font-bold text-danger">
          😅 {submitError}
        </div>
      )}

      {result && <ResultBox passed={result.passed} />}
    </div>
  );
}
