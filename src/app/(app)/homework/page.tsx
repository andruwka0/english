import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomeworkListPage() {
  const session = await getSession();
  const homeworks = await prisma.homework.findMany({
    orderBy: { order: "asc" },
    include: {
      submissions: { select: { passed: true } },
      _count: { select: { submissions: true } },
    },
  });

  const total = homeworks.length;
  const passedCount = homeworks.filter((hw) => hw.submissions.some((s) => s.passed)).length;
  const percent = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const allDone = total > 0 && passedCount === total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-ink">📝 Домашки</h1>
        {session.role === "teacher" && (
          <Link
            href="/homework/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark"
          >
            + Новая домашка
          </Link>
        )}
      </div>

      {total > 0 && (
        <div className="space-y-2 rounded-3xl border-2 border-primary-soft bg-white p-5">
          <div className="flex items-center justify-between text-sm font-bold text-ink">
            <span>🌟 Прогресс</span>
            <span>
              {passedCount} / {total}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-primary-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-pink to-yellow transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {allDone && (
            <p className="text-sm font-bold text-success">
              🏆 Ура! Все домашки на сегодня выполнены!
            </p>
          )}
        </div>
      )}

      {homeworks.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-8 text-center text-ink-soft">
          Пока нет ни одной домашки. 🌱
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {homeworks.map((hw) => {
            const passedEver = hw.submissions.some((s) => s.passed);
            const status = passedEver
              ? { label: "Сдано", emoji: "⭐", cls: "bg-success-soft text-success", border: "border-success/30" }
              : hw._count.submissions > 0
                ? { label: "Есть попытки", emoji: "💪", cls: "bg-yellow-soft text-ink", border: "border-yellow/40" }
                : { label: "Не сдано", emoji: "⚪", cls: "bg-slate-100 text-slate-600", border: "border-slate-200" };

            const attemptsLeft =
              hw.maxAttempts !== null ? Math.max(hw.maxAttempts - hw._count.submissions, 0) : null;

            return (
              <li key={hw.id}>
                <Link
                  href={`/homework/${hw.id}`}
                  className={`wiggle-hover flex h-full flex-col justify-between gap-3 rounded-3xl border-2 bg-white p-5 shadow-sm transition ${status.border}`}
                >
                  <span className="font-heading text-lg font-bold text-ink">{hw.title}</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-bold ${status.cls}`}>
                      {status.emoji} {status.label}
                    </span>
                    {session.role === "teacher" && (
                      <span className="rounded-full bg-primary-soft px-3 py-1 font-bold text-primary">
                        {hw._count.submissions} попыт{hw._count.submissions === 1 ? "ка" : "ок"}
                      </span>
                    )}
                    {session.role === "student" && attemptsLeft !== null && (
                      <span className="rounded-full bg-teal-soft px-3 py-1 font-bold text-teal">
                        осталось попыток: {attemptsLeft}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
