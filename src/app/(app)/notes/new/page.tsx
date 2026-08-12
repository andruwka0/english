import { requireTeacher } from "@/lib/auth";
import { NoteForm } from "../NoteForm";
import { createNote } from "../actions";

export default async function NewNotePage() {
  await requireTeacher();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-ink">✨ Новый конспект</h1>
      <NoteForm action={createNote} submitLabel="Создать" />
    </div>
  );
}
