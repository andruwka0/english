import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Solver } from "./Solver";
import { DeleteHomeworkButton } from "./DeleteHomeworkButton";

export default async function HomeworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, homework] = await Promise.all([
    getSession(),
    prisma.homework.findUnique({
      where: { id },
      include: { submissions: { orderBy: { submittedAt: "desc" } } },
    }),
  ]);

  if (!homework) notFound();

  const attemptsUsed = homework.submissions.length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-ink">{homework.title}</h1>
        {session.role === "teacher" && (
          <div className="flex shrink-0 gap-3 text-sm font-bold">
            <Link
              href={`/homework/${homework.id}/edit`}
              className="rounded-full px-3 py-1.5 text-ink-soft transition hover:bg-primary-soft hover:text-primary"
            >
              Редактировать
            </Link>
            <DeleteHomeworkButton id={homework.id} />
          </div>
        )}
      </div>

      <div className="rounded-3xl border-2 border-primary-soft bg-white p-6">
        <MarkdownRenderer content={homework.description} />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-ink">💻 Решение</h2>
        <Solver
          homeworkId={homework.id}
          starterCode={homework.starterCode}
          testCode={homework.testCode}
          maxAttempts={homework.maxAttempts}
          attemptsUsed={attemptsUsed}
        />
      </section>

      {session.role === "teacher" && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ink">📜 История сдач</h2>
          {homework.submissions.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-6 text-center text-sm text-ink-soft">
              Ещё не сдавала. 🌱
            </p>
          ) : (
            <ul className="space-y-3">
              {homework.submissions.map((s) => (
                <li key={s.id} className="rounded-2xl border-2 border-primary-soft bg-white p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-soft">
                      {new Date(s.submittedAt).toLocaleString("ru-RU")}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${
                        s.passed ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                      }`}
                    >
                      {s.passed ? "🎉 Пройдено" : "😅 Провалено"}
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-ink p-3 text-xs text-white">{s.code}</pre>
                  {s.output && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-ink-soft">{s.output}</pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
