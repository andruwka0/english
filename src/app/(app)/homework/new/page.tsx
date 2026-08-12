import { requireTeacher } from "@/lib/auth";
import { HomeworkForm } from "../HomeworkForm";
import { createHomework } from "../actions";

export default async function NewHomeworkPage() {
  await requireTeacher();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-ink">✨ Новая домашка</h1>
      <HomeworkForm action={createHomework} submitLabel="Создать" />
    </div>
  );
}
