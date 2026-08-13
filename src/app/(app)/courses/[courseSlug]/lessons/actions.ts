"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { requireRole, requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { validateTaskDraft, type TaskKindValue } from "@/lib/tasks";
import { gradeAnswer } from "@/lib/grading";
import type { CourseSlug } from "@/generated/prisma/client";

type ParsedTask = {
  kind: TaskKindValue;
  title: string;
  prompt: string;
  maxAttempts: number | null;
  data: unknown;
};

function parseTasks(raw: string): { tasks: ParsedTask[] } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Не получилось прочитать задания — попробуй ещё раз" };
  }
  if (!Array.isArray(parsed)) return { error: "Некорректный формат заданий" };
  for (let i = 0; i < parsed.length; i++) {
    const err = validateTaskDraft(parsed[i], i);
    if (err) return { error: err };
  }
  return { tasks: parsed as ParsedTask[] };
}

async function resolveCourseId(courseSlug: string): Promise<string> {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug as CourseSlug } });
  if (!course) notFound();
  return course.id;
}

export async function saveLesson(
  courseSlug: string,
  lessonId: string | null,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  await requireTeacher();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const deadlineEnabled = formData.get("deadlineEnabled") === "on";
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const tasksJson = String(formData.get("tasksJson") ?? "[]");

  if (!title || !content.trim()) {
    return { error: "Заполни заголовок и конспект" };
  }

  const parsedTasks = parseTasks(tasksJson);
  if ("error" in parsedTasks) return { error: parsedTasks.error };

  const deadline = deadlineEnabled && deadlineRaw ? new Date(deadlineRaw) : null;
  const taskCreateData = parsedTasks.tasks.map((t, i) => ({
    kind: t.kind,
    title: t.title.trim(),
    prompt: t.prompt,
    maxAttempts: t.maxAttempts,
    data: t.data as object,
    order: i,
  }));

  let slug: string;
  let lessonIdOut: string;

  if (lessonId) {
    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { homework: true },
    });
    if (!existing) notFound();
    slug = existing.slug;
    lessonIdOut = existing.id;

    await prisma.lesson.update({ where: { id: lessonId }, data: { title, content } });

    if (existing.homework) {
      await prisma.$transaction([
        prisma.homework.update({ where: { id: existing.homework.id }, data: { deadline } }),
        prisma.task.deleteMany({ where: { homeworkId: existing.homework.id } }),
        ...(taskCreateData.length
          ? [
              prisma.task.createMany({
                data: taskCreateData.map((t) => ({ ...t, homeworkId: existing.homework!.id })),
              }),
            ]
          : []),
      ]);
    } else {
      await prisma.homework.create({
        data: {
          lessonId: existing.id,
          deadline,
          tasks: { create: taskCreateData },
        },
      });
    }
  } else {
    const courseId = await resolveCourseId(courseSlug);
    const baseSlug = slugify(title, "lesson");
    let uniqueSlug = baseSlug;
    if (await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug: uniqueSlug } } })) {
      uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }
    const maxOrder = await prisma.lesson.aggregate({ where: { courseId }, _max: { order: true } });

    const created = await prisma.lesson.create({
      data: {
        courseId,
        slug: uniqueSlug,
        title,
        content,
        order: (maxOrder._max.order ?? 0) + 1,
        homework: { create: { deadline, tasks: { create: taskCreateData } } },
      },
    });
    slug = created.slug;
    lessonIdOut = created.id;
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}/lessons/${slug}`);
  redirect(`/courses/${courseSlug}/lessons/${slug}`);
  // unreachable, keeps TS happy if redirect signature ever changes
  void lessonIdOut;
}

export async function deleteLesson(courseSlug: string, lessonId: string) {
  await requireTeacher();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/courses/${courseSlug}`);
  redirect(`/courses/${courseSlug}`);
}

export async function submitTask(
  taskId: string,
  payload:
    | { kind: "CODE"; passed: boolean; code: string; output: string }
    | { kind: "MATCHING"; given: { term: string; translation: string }[] }
    | { kind: "FILL_BLANK"; chosenOption: string }
    | { kind: "MULTIPLE_CHOICE"; chosenIndex: number },
): Promise<{ ok: boolean; passed?: boolean; error?: string }> {
  await requireRole();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { homework: { include: { lesson: { include: { course: true } } } }, _count: { select: { submissions: true } } },
  });
  if (!task) return { ok: false, error: "Задание не найдено" };
  if (task.maxAttempts !== null && task._count.submissions >= task.maxAttempts) {
    return { ok: false, error: "Лимит попыток исчерпан" };
  }

  let passed: boolean;
  let code: string | null = null;
  let output: string | null = null;
  let answer: object | null = null;

  if (payload.kind === "CODE") {
    passed = payload.passed;
    code = payload.code;
    output = payload.output;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passed = gradeAnswer(task.data as any, payload as any);
    if (payload.kind === "MATCHING") answer = { kind: "MATCHING", given: payload.given };
    if (payload.kind === "FILL_BLANK") answer = { kind: "FILL_BLANK", chosenOption: payload.chosenOption };
    if (payload.kind === "MULTIPLE_CHOICE") answer = { kind: "MULTIPLE_CHOICE", chosenIndex: payload.chosenIndex };
  }

  await prisma.submission.create({ data: { taskId, passed, code, output, answer: answer ?? undefined } });

  const courseSlug = task.homework.lesson.course.slug;
  const lessonSlug = task.homework.lesson.slug;
  revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/profile");

  return { ok: true, passed };
}
