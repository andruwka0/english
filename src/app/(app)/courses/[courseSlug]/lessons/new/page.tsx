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
      <h1 className="font-heading text-2xl font-bold text-ink">✨ Новый урок</h1>
      <LessonForm action={boundSave} submitLabel="Создать" allowedKinds={allowedKinds} />
    </div>
  );
}
