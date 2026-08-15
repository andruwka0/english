import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import type { TaskKindValue } from "@/lib/tasks";
import { LessonForm } from "../LessonForm";
import { saveLesson } from "../actions";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  await requireTeacher();
  const { courseSlug } = await params;
  if (courseSlug !== "python" && courseSlug !== "english") notFound();

  const allowedKinds: TaskKindValue[] =
    courseSlug === "python" ? ["CODE"] : ["MATCHING", "FILL_BLANK", "MULTIPLE_CHOICE"];

  const boundSave = saveLesson.bind(null, courseSlug, null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
        >
          ← К курсу
        </Link>
        <h1 className="font-heading text-2xl font-bold text-ink">✨ Новый урок</h1>
      </div>
      <LessonForm action={boundSave} submitLabel="Создать" allowedKinds={allowedKinds} />
    </div>
  );
}
