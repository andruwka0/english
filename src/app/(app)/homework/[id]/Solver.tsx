"use client";

import { useState, useTransition } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { runStudentCode, type RunResult } from "@/lib/pyodide";
import { submitHomework } from "../actions";

export function Solver({
  homeworkId,
  starterCode,
  testCode,
  maxAttempts,
  attemptsUsed,
}: {
  homeworkId: string;
  starterCode: string;
  testCode: string;
  maxAttempts: number | null;
  attemptsUsed: number;
}) {
  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [used, setUsed] = useState(attemptsUsed);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const attemptsLeft = maxAttempts !== null ? Math.max(maxAttempts - used, 0) : null;
  const limitReached = attemptsLeft !== null && attemptsLeft <= 0;

  async function handleRun() {
    setRunning(true);
    setPyodideLoading(true);
    setSubmitted(false);
    setSubmitError(null);
    try {
      const res = await runStudentCode(code, testCode);
      setResult(res);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  }

  function handleSubmit() {
    if (!result || limitReached) return;
    startTransition(async () => {
      const res = await submitHomework(homeworkId, code, result.passed, result.error ?? result.output);
      if (res.ok) {
        setUsed((n) => n + 1);
        setSubmitted(true);
      } else {
        setSubmitError(res.error ?? "Не получилось сдать");
      }
    });
  }

  return (
    <div className="space-y-4">
      <CodeEditor value={code} onChange={setCode} height="280px" />

      {maxAttempts !== null && (
        <p className="text-sm font-bold text-ink-soft">
          🎯 Осталось попыток на сдачу: {attemptsLeft} из {maxAttempts}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRun}
          disabled={running}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100"
        >
          {running ? (pyodideLoading ? "🐍 Загружаю Python..." : "⏳ Выполняю...") : "▶ Запустить"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!result || isPending || limitReached}
          className="rounded-full border-2 border-primary-soft px-5 py-2.5 text-sm font-bold text-primary transition hover:scale-105 hover:bg-primary-soft disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? "Отправка..." : submitted ? "Сдано ✓" : "Сдать"}
        </button>
        {limitReached && (
          <span className="rounded-full bg-danger-soft px-3 py-1.5 text-sm font-bold text-danger">
            Лимит попыток исчерпан
          </span>
        )}
      </div>

      {submitError && (
        <div className="rounded-2xl border-2 border-danger/30 bg-danger-soft p-4 text-sm font-bold text-danger">
          😅 {submitError}
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl border-2 p-4 text-sm ${
            result.passed
              ? "border-success/30 bg-success-soft text-success"
              : "border-danger/30 bg-danger-soft text-danger"
          }`}
        >
          <p className="font-heading text-base font-bold">
            {result.passed ? "🎉 Тесты пройдены!" : "🤔 Есть ошибка, попробуй ещё раз"}
          </p>
          {result.friendlyError && (
            <p className="mt-2 font-bold">💡 {result.friendlyError}</p>
          )}
          {result.output && (
            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{result.output}</pre>
          )}
          {result.error && (
            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs opacity-60">
              {result.error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
