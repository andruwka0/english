"use client";

import { useState, useTransition } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { runStudentCode, type RunResult } from "@/lib/pyodide";
import { submitProject } from "@/app/(app)/courses/[courseSlug]/projects/[projectSlug]/actions";
import { ResultBox, primaryButtonCls, submitButtonCls } from "@/components/exercises/shared";

export function ProjectRunner({
  projectId,
  starterCode,
  testCode,
  attemptsUsed,
  passedCode,
}: {
  projectId: string;
  starterCode: string;
  testCode: string;
  attemptsUsed: number;
  passedCode: string | null;
}) {
  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [used, setUsed] = useState(attemptsUsed);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (passedCode !== null) {
    return (
      <div className="rounded-2xl border-2 border-success/30 bg-success-soft p-5">
        <p className="font-heading text-lg font-bold text-success">Проект принят</p>
        <p className="mt-1 text-sm text-ink-soft">Правильная версия проекта сохранена:</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-xs text-white">{passedCode}</pre>
      </div>
    );
  }

  async function handleRun() {
    setRunning(true);
    setPyodideLoading(true);
    setSubmitted(false);
    setSubmitError(null);
    try {
      setResult(await runStudentCode(code, testCode));
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  }

  function handleSubmit() {
    if (!result) return;
    startTransition(async () => {
      const response = await submitProject(projectId, {
        passed: result.passed,
        code,
        output: result.error ?? result.output,
      });
      if (response.ok) {
        setUsed((count) => count + 1);
        setSubmitted(true);
      }
      else setSubmitError(response.error ?? "Не получилось сохранить попытку");
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">Попыток сохранено: {used}</p>
      <CodeEditor value={code} onChange={setCode} height="420px" />
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleRun} disabled={running} className={primaryButtonCls}>
          {running ? (pyodideLoading ? "Загружаю Python..." : "Проверяю...") : "Проверить проект"}
        </button>
        <button onClick={handleSubmit} disabled={!result || isPending} className={submitButtonCls}>
          {isPending ? "Сохраняю..." : submitted ? "Попытка сохранена" : "Сдать проект"}
        </button>
      </div>
      {submitError && <p className="rounded-2xl border-2 border-danger/30 bg-danger-soft p-4 text-sm font-bold text-danger">{submitError}</p>}
      {result && (
        <ResultBox passed={result.passed} passedLabel="Все проверки пройдены" failedLabel="Проект пока не прошел проверку">
          {result.friendlyError && <p className="mt-2 font-bold">{result.friendlyError}</p>}
          {result.output && <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{result.output}</pre>}
          {result.error && <pre className="mt-2 whitespace-pre-wrap font-mono text-xs opacity-60">{result.error}</pre>}
        </ResultBox>
      )}
    </div>
  );
}
