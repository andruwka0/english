"use client";

import { useState, useTransition } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { runStudentCode, type RunResult } from "@/lib/pyodide";
import { submitTask } from "@/app/(app)/courses/[courseSlug]/lessons/actions";
import type { TaskData } from "@/lib/tasks";
import { AttemptsInfo, LimitReachedBadge, ResultBox, primaryButtonCls, submitButtonCls } from "./shared";

export function CodeTask({
  taskId,
  data,
  maxAttempts,
  attemptsUsed,
  passedCode,
}: {
  taskId: string;
  data: Extract<TaskData, { kind: "CODE" }>;
  maxAttempts: number | null;
  attemptsUsed: number;
  passedCode: string | null;
}) {
  const [code, setCode] = useState(data.starterCode);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [used, setUsed] = useState(attemptsUsed);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (passedCode !== null) {
    return (
      <div className="rounded-xl border border-success/30 bg-success-soft p-4">
        <p className="font-bold text-success">Задание выполнено</p>
        <p className="mt-1 text-sm text-ink-soft">Твое правильное решение:</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink p-3 text-xs text-white">{passedCode}</pre>
      </div>
    );
  }

  const attemptsLeft = maxAttempts !== null ? Math.max(maxAttempts - used, 0) : null;
  const limitReached = attemptsLeft !== null && attemptsLeft <= 0;

  async function handleRun() {
    setRunning(true);
    setPyodideLoading(true);
    setSubmitted(false);
    setSubmitError(null);
    try {
      const res = await runStudentCode(code, data.testCode);
      setResult(res);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  }

  function handleSubmit() {
    if (!result || limitReached) return;
    startTransition(async () => {
      const res = await submitTask(taskId, {
        kind: "CODE",
        passed: result.passed,
        code,
        output: result.error ?? result.output,
      });
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
      <CodeEditor value={code} onChange={setCode} height="220px" />

      <AttemptsInfo maxAttempts={maxAttempts} used={used} />

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleRun} disabled={running} className={primaryButtonCls}>
          {running ? (pyodideLoading ? "🐍 Загружаю Python..." : "⏳ Выполняю...") : "▶ Запустить"}
        </button>
        <button
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

      {result && (
        <ResultBox passed={result.passed} passedLabel="🎉 Тесты пройдены!" failedLabel="🤔 Есть ошибка, попробуй ещё раз">
          {result.friendlyError && <p className="mt-2 font-bold">💡 {result.friendlyError}</p>}
          {result.output && <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{result.output}</pre>}
          {result.error && (
            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs opacity-60">{result.error}</pre>
          )}
        </ResultBox>
      )}
    </div>
  );
}
