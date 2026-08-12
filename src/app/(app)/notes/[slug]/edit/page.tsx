import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteForm } from "../../NoteForm";
import { updateNote } from "../../actions";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireTeacher();
  const { slug } = await params;
  const note = await prisma.note.findUnique({ where: { slug } });
  if (!note) notFound();

  const boundUpdate = updateNote.bind(null, slug);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-ink">✏️ Редактировать конспект</h1>
      <NoteForm
        action={boundUpdate}
        submitLabel="Сохранить"
        initialTitle={note.title}
        initialContent={note.content}
      />
    </div>
  );
}
