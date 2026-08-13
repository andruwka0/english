export function AttemptsInfo({ maxAttempts, used }: { maxAttempts: number | null; used: number }) {
  if (maxAttempts === null) return null;
  const left = Math.max(maxAttempts - used, 0);
  return (
    <p className="text-sm font-bold text-ink-soft">
      🎯 Осталось попыток на сдачу: {left} из {maxAttempts}
    </p>
  );
}

export function LimitReachedBadge() {
  return (
    <span className="rounded-full bg-danger-soft px-3 py-1.5 text-sm font-bold text-danger">
      Лимит попыток исчерпан
    </span>
  );
}

export function ResultBox({
  passed,
  passedLabel = "🎉 Верно!",
  failedLabel = "🤔 Не совсем, попробуй ещё раз",
  children,
}: {
  passed: boolean;
  passedLabel?: string;
  failedLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 text-sm ${
        passed ? "border-success/30 bg-success-soft text-success" : "border-danger/30 bg-danger-soft text-danger"
      }`}
    >
      <p className="font-heading text-base font-bold">{passed ? passedLabel : failedLabel}</p>
      {children}
    </div>
  );
}

export const submitButtonCls =
  "rounded-full border-2 border-primary-soft px-5 py-2.5 text-sm font-bold text-primary transition hover:scale-105 hover:bg-primary-soft disabled:opacity-50 disabled:hover:scale-100";

export const primaryButtonCls =
  "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100";
