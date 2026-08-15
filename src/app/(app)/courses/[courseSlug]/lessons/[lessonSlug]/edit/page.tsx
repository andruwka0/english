import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CourseSlug } from "@/generated/prisma/client";
import type { TaskData, TaskDraft, TaskKindValue } from "@/lib/tasks";
import { LessonForm } from "../../LessonForm";
import { saveLesson } from "../../actions";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  await requireTeacher();
  const { courseSlug, lessonSlug } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug: courseSlug as CourseSlug } },
    include: { homework: { include: { tasks: { orderBy: { order: "asc" } } } } },
  });
  if (!lesson) notFound();

  const allowedKinds: TaskKindValue[] =
    courseSlug === "python" ? ["CODE"] : ["MATCHING", "FILL_BLANK", "MULTIPLE_CHOICE"];

  const initialTasks: TaskDraft[] = (lesson.homework?.tasks ?? []).map((t) => ({
    localId: t.id,
    dbId: t.id,
    kind: t.kind as TaskKindValue,
    title: t.title,
    prompt: t.prompt,
    maxAttempts: t.maxAttempts,
    data: t.data as TaskData,
  }));

  const initialDeadline = lesson.homework?.deadline
    ? lesson.homework.deadline.toISOString().slice(0, 10)
    : null;

  const boundSave = saveLesson.bind(null, courseSlug, lesson.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
          className="inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
        >
          ← К уроку
        </Link>
        <h1 className="font-heading text-2xl font-bold text-ink">✏️ Редактировать урок</h1>
      </div>
      <LessonForm
        action={boundSave}
        submitLabel="Сохранить"
        allowedKinds={allowedKinds}
        initialTitle={lesson.title}
        initialContent={lesson.content}
        initialDeadline={initialDeadline}
        initialTasks={initialTasks}
      />
    </div>
  );
}
