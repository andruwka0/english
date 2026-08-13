"use client";

import { useState, useTransition } from "react";
import { gradeFillBlank } from "@/lib/grading";
import type { TaskData } from "@/lib/tasks";
import { submitTask } from "@/app/(app)/courses/[courseSlug]/lessons/actions";
import { AttemptsInfo, LimitReachedBadge, ResultBox, primaryButtonCls, submitButtonCls } from "./shared";

export function FillBlankTask({
  taskId,
  data,
  maxAttempts,
  attemptsUsed,
}: {
  taskId: string;
  data: Extract<TaskData, { kind: "FILL_BLANK" }>;
  maxAttempts: number | null;
  attemptsUsed: number;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [used, setUsed] = useState(attemptsUsed);
  const [result, setResult] = useState<{ passed: boolean } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const attemptsLeft = maxAttempts !== null ? Math.max(maxAttempts - used, 0) : null;
  const limitReached = attemptsLeft !== null && attemptsLeft <= 0;

  const [before, after] = data.sentence.split("___");

  function pick(opt: string) {
    setChosen(opt);
    setResult(null);
    setSubmitted(false);
  }

  function handleCheck() {
    if (!chosen) return;
    setResult({ passed: gradeFillBlank(data, chosen) });
  }

  function handleSubmit() {
    if (!result || !chosen || limitReached) return;
    startTransition(async () => {
      const res = await submitTask(taskId, { kind: "FILL_BLANK", chosenOption: chosen });
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
      <p className="rounded-2xl border-2 border-primary-soft bg-cream p-4 text-lg font-bold text-ink">
        {before}
        <span className="mx-1 inline-block min-w-16 rounded-lg border-b-4 border-dashed border-primary px-2 py-0.5 text-center text-primary">
          {chosen ?? "___"}
        </span>
        {after}
      </p>

      <div className="flex flex-wrap gap-2">
        {data.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              chosen === opt
                ? "bg-primary text-white"
                : "border-2 border-primary-soft text-ink hover:bg-primary-soft"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <AttemptsInfo maxAttempts={maxAttempts} used={used} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleCheck} disabled={!chosen} className={primaryButtonCls}>
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
