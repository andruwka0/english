"use client";

import { useMemo, useState, useTransition } from "react";
import { gradeMatching } from "@/lib/grading";
import type { TaskData } from "@/lib/tasks";
import { submitTask } from "@/app/(app)/courses/[courseSlug]/lessons/actions";
import { AttemptsInfo, LimitReachedBadge, ResultBox, primaryButtonCls, submitButtonCls } from "./shared";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingTask({
  taskId,
  data,
  maxAttempts,
  attemptsUsed,
}: {
  taskId: string;
  data: Extract<TaskData, { kind: "MATCHING" }>;
  maxAttempts: number | null;
  attemptsUsed: number;
}) {
  const translations = useMemo(() => shuffle(data.pairs.map((p) => p.translation)), [data]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [used, setUsed] = useState(attemptsUsed);
  const [result, setResult] = useState<{ passed: boolean } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const attemptsLeft = maxAttempts !== null ? Math.max(maxAttempts - used, 0) : null;
  const limitReached = attemptsLeft !== null && attemptsLeft <= 0;
  const matchedTranslations = Object.values(matched);
  const allMatched = Object.keys(matched).length === data.pairs.length;

  function pickTerm(term: string) {
    if (matched[term]) return;
    setSelectedTerm(term === selectedTerm ? null : term);
    setResult(null);
    setSubmitted(false);
  }

  function pickTranslation(translation: string) {
    if (matchedTranslations.includes(translation) || !selectedTerm) return;
    setMatched((m) => ({ ...m, [selectedTerm]: translation }));
    setSelectedTerm(null);
    setResult(null);
    setSubmitted(false);
  }

  function reset() {
    setMatched({});
    setSelectedTerm(null);
    setResult(null);
    setSubmitted(false);
  }

  function handleCheck() {
    const given = Object.entries(matched).map(([term, translation]) => ({ term, translation }));
    setResult({ passed: gradeMatching(data, given) });
  }

  function handleSubmit() {
    if (!result || limitReached) return;
    const given = Object.entries(matched).map(([term, translation]) => ({ term, translation }));
    startTransition(async () => {
      const res = await submitTask(taskId, { kind: "MATCHING", given });
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {data.pairs.map((p) => (
            <button
              key={p.term}
              type="button"
              onClick={() => pickTerm(p.term)}
              disabled={!!matched[p.term]}
              className={`w-full rounded-full px-4 py-2 text-sm font-bold transition ${
                matched[p.term]
                  ? "bg-success-soft text-success"
                  : selectedTerm === p.term
                    ? "bg-primary text-white"
                    : "border-2 border-primary-soft text-ink hover:bg-primary-soft"
              }`}
            >
              {p.term}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {translations.map((tr) => {
            const isMatched = matchedTranslations.includes(tr);
            return (
              <button
                key={tr}
                type="button"
                onClick={() => pickTranslation(tr)}
                disabled={isMatched}
                className={`w-full rounded-full px-4 py-2 text-sm font-bold transition ${
                  isMatched
                    ? "bg-success-soft text-success"
                    : "border-2 border-primary-soft text-ink hover:bg-primary-soft"
                }`}
              >
                {tr}
              </button>
            );
          })}
        </div>
      </div>

      <AttemptsInfo maxAttempts={maxAttempts} used={used} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleCheck} disabled={!allMatched} className={primaryButtonCls}>
          Проверить
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft hover:bg-primary-soft"
        >
          Сбросить
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
