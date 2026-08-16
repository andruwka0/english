import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TaskRunner } from "@/components/exercises/TaskRunner";
import type { TaskData } from "@/lib/tasks";
import type { CourseSlug } from "@/generated/prisma/client";
import { DeleteLessonButton } from "./DeleteLessonButton";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "homework" ? "homework" : "content";
  const [session, lesson] = await Promise.all([
    getSession(),
    prisma.lesson.findFirst({
      where: { slug: lessonSlug, course: { slug: courseSlug as CourseSlug } },
      include: {
        course: true,
        homework: {
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: { submissions: { orderBy: { submittedAt: "desc" } } },
            },
          },
        },
      },
    }),
  ]);

  if (!lesson) notFound();

  if (session.role === "student") {
    const previousLessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId, order: { lt: lesson.order } },
      include: { homework: { include: { tasks: { include: { submissions: { select: { passed: true } } } } } } },
    });
    const blocked = previousLessons.some((previousLesson) =>
      (previousLesson.homework?.tasks ?? []).some((task) => !task.submissions.some((submission) => submission.passed)),
    );
    if (blocked) redirect(`/courses/${courseSlug}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/courses/${courseSlug}`}
            className="mb-2 inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
          >
            ← К курсу
          </Link>
          <p className="text-sm font-bold text-ink-soft">
            {lesson.course.icon} {lesson.course.title}
          </p>
          <h1 className="font-heading text-2xl font-bold text-ink">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === "content"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-ink-soft hover:bg-primary-soft hover:text-primary"
              }`}
            >
              📖 Конспект
            </Link>
            <Link
              href={`/courses/${courseSlug}/lessons/${lesson.slug}?tab=homework`}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === "homework"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-ink-soft hover:bg-primary-soft hover:text-primary"
              }`}
            >
              📝 Домашнее задание
            </Link>
          </div>
        </div>
        {session.role === "teacher" && (
          <div className="flex shrink-0 gap-3 text-sm font-bold">
            <Link
              href={`/courses/${courseSlug}/lessons/${lesson.slug}/edit`}
              className="rounded-full px-3 py-1.5 text-ink-soft transition hover:bg-primary-soft hover:text-primary"
            >
              Редактировать
            </Link>
            <DeleteLessonButton courseSlug={courseSlug} lessonId={lesson.id} />
          </div>
        )}
      </div>

      {activeTab === "content" && (
        <div className="rounded-3xl border-2 border-primary-soft bg-white p-6">
          <MarkdownRenderer content={lesson.content} />
        </div>
      )}

      {activeTab === "homework" && lesson.homework && lesson.homework.deadline && (
        <p className="rounded-2xl bg-teal-soft px-4 py-2 text-sm font-bold text-teal">
          📅 Дедлайн: {new Date(lesson.homework.deadline).toLocaleDateString("ru-RU")}
        </p>
      )}

      {activeTab === "homework" && lesson.homework && lesson.homework.tasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-ink">📝 Домашка</h2>
          {lesson.homework.tasks.map((task, i) => {
            const passedSubmission = task.submissions.find((submission) => submission.passed);
            return (
              <TaskRunner
                key={task.id}
                taskId={task.id}
                title={task.title}
                prompt={task.prompt}
                data={task.data as TaskData}
                maxAttempts={task.maxAttempts}
                attemptsUsed={task.submissions.length}
                passedCode={passedSubmission?.code ?? null}
                index={i}
              />
            );
          })}
        </section>
      )}

      {activeTab === "homework" && session.role === "teacher" && lesson.homework && lesson.homework.tasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-ink">📜 История сдач</h2>
          {lesson.homework.tasks.map((task) => (
            <div key={task.id} className="space-y-2">
              <h3 className="text-sm font-bold text-ink-soft">{task.title}</h3>
              {task.submissions.length === 0 ? (
                <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-4 text-center text-sm text-ink-soft">
                  Ещё не сдавала. 🌱
                </p>
              ) : (
                <ul className="space-y-2">
                  {task.submissions.map((s) => (
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
                      {s.code && (
                        <pre className="overflow-x-auto rounded-xl bg-ink p-3 text-xs text-white">{s.code}</pre>
                      )}
                      {s.output && (
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-ink-soft">{s.output}</pre>
                      )}
                      {s.answer !== null && !s.code && (
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-ink-soft">
                          {JSON.stringify(s.answer)}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
