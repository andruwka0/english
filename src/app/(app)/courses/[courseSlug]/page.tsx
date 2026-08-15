import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CourseSlug } from "@/generated/prisma/client";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const [session, course] = await Promise.all([
    getSession(),
    prisma.course.findUnique({
      where: { slug: courseSlug as CourseSlug },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            homework: {
              include: {
                tasks: { include: { submissions: { select: { passed: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!course) notFound();

  const total = course.lessons.reduce((n, l) => n + (l.homework?.tasks.length ?? 0), 0);
  const passedCount = course.lessons.reduce(
    (n, l) => n + (l.homework?.tasks.filter((t) => t.submissions.some((s) => s.passed)).length ?? 0),
    0,
  );
  const percent = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const allDone = total > 0 && passedCount === total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-ink">
          {course.icon} {course.title}
        </h1>
        {session.role === "teacher" && (
          <Link
            href={`/courses/${course.slug}/lessons/new`}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:scale-105 hover:bg-primary-dark"
          >
            + Новый урок
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
            <p className="text-sm font-bold text-success">🏆 Ура! Все задания курса выполнены!</p>
          )}
        </div>
      )}

      {course.lessons.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-8 text-center text-ink-soft">
          Пока нет ни одного урока. 🌱
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {course.lessons.map((lesson, index) => {
            const tasks = lesson.homework?.tasks ?? [];
            const lessonPassed = tasks.filter((t) => t.submissions.some((s) => s.passed)).length;
            const previousHomeworkDone = course.lessons.slice(0, index).every((previousLesson) => {
              const previousTasks = previousLesson.homework?.tasks ?? [];
              return previousTasks.every((task) => task.submissions.some((submission) => submission.passed));
            });
            const locked = session.role === "student" && !previousHomeworkDone;
            const status =
              locked
                ? { label: "Сначала выполни прошлую домашку", emoji: "🔒", cls: "bg-slate-100 text-slate-600", border: "border-slate-200" }
                : tasks.length === 0
                ? { label: "Только конспект", emoji: "📖", cls: "bg-slate-100 text-slate-600", border: "border-slate-200" }
                : lessonPassed === tasks.length
                  ? { label: "Сдано", emoji: "⭐", cls: "bg-success-soft text-success", border: "border-success/30" }
                  : lessonPassed > 0
                    ? { label: "Есть попытки", emoji: "💪", cls: "bg-yellow-soft text-ink", border: "border-yellow/40" }
                    : { label: "Не сдано", emoji: "⚪", cls: "bg-slate-100 text-slate-600", border: "border-slate-200" };

            return (
              <li key={lesson.id}>
                {locked ? (
                  <div className={`flex h-full flex-col justify-between gap-3 rounded-3xl border-2 bg-white/60 p-5 shadow-sm ${status.border}`}>
                    <LessonCardContent lesson={lesson} lessonPassed={lessonPassed} tasks={tasks} status={status} />
                  </div>
                ) : (
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    className={`wiggle-hover flex h-full flex-col justify-between gap-3 rounded-3xl border-2 bg-white p-5 shadow-sm transition ${status.border}`}
                  >
                    <LessonCardContent lesson={lesson} lessonPassed={lessonPassed} tasks={tasks} status={status} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LessonCardContent({
  lesson,
  lessonPassed,
  tasks,
  status,
}: {
  lesson: { title: string; homework: { deadline: Date | null } | null };
  lessonPassed: number;
  tasks: unknown[];
  status: { label: string; emoji: string; cls: string };
}) {
  return (
    <>
      <span className="font-heading text-lg font-bold text-ink">{lesson.title}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-3 py-1 font-bold ${status.cls}`}>
          {status.emoji} {status.label}
        </span>
        {tasks.length > 0 && (
          <span className="rounded-full bg-primary-soft px-3 py-1 font-bold text-primary">
            {lessonPassed} / {tasks.length} заданий
          </span>
        )}
        {lesson.homework?.deadline && (
          <span className="rounded-full bg-teal-soft px-3 py-1 font-bold text-teal">
            📅 до {new Date(lesson.homework.deadline).toLocaleDateString("ru-RU")}
          </span>
        )}
      </div>
    </>
  );
}
