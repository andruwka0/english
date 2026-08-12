import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeworkForm } from "../../HomeworkForm";
import { updateHomework } from "../../actions";

export default async function EditHomeworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeacher();
  const { id } = await params;
  const homework = await prisma.homework.findUnique({ where: { id } });
  if (!homework) notFound();

  const boundUpdate = updateHomework.bind(null, id);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-ink">✏️ Редактировать домашку</h1>
      <HomeworkForm
        action={boundUpdate}
        submitLabel="Сохранить"
        initialTitle={homework.title}
        initialDescription={homework.description}
        initialStarterCode={homework.starterCode}
        initialTestCode={homework.testCode}
        initialMaxAttempts={homework.maxAttempts}
      />
    </div>
  );
}
