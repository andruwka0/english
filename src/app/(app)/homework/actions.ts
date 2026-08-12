"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseMaxAttempts(formData: FormData): number | null {
  const raw = String(formData.get("maxAttempts") ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createHomework(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  await requireTeacher();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const starterCode = String(formData.get("starterCode") ?? "");
  const testCode = String(formData.get("testCode") ?? "");
  const maxAttempts = parseMaxAttempts(formData);

  if (!title || !description.trim() || !testCode.trim()) {
    return { error: "Заполни заголовок, описание и тест" };
  }

  const maxOrder = await prisma.homework.aggregate({ _max: { order: true } });
  const homework = await prisma.homework.create({
    data: {
      title,
      description,
      starterCode,
      testCode,
      maxAttempts,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidatePath("/homework");
  redirect(`/homework/${homework.id}`);
}

export async function updateHomework(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  await requireTeacher();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const starterCode = String(formData.get("starterCode") ?? "");
  const testCode = String(formData.get("testCode") ?? "");
  const maxAttempts = parseMaxAttempts(formData);

  if (!title || !description.trim() || !testCode.trim()) {
    return { error: "Заполни заголовок, описание и тест" };
  }

  await prisma.homework.update({
    where: { id },
    data: { title, description, starterCode, testCode, maxAttempts },
  });

  revalidatePath("/homework");
  revalidatePath(`/homework/${id}`);
  redirect(`/homework/${id}`);
}

export async function deleteHomework(id: string) {
  await requireTeacher();
  await prisma.homework.delete({ where: { id } });
  revalidatePath("/homework");
  redirect("/homework");
}

export async function submitHomework(
  homeworkId: string,
  code: string,
  passed: boolean,
  output: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole();

  const homework = await prisma.homework.findUnique({
    where: { id: homeworkId },
    select: { maxAttempts: true, _count: { select: { submissions: true } } },
  });
  if (!homework) {
    return { ok: false, error: "Домашка не найдена" };
  }
  if (homework.maxAttempts !== null && homework._count.submissions >= homework.maxAttempts) {
    return { ok: false, error: "Лимит попыток исчерпан" };
  }

  await prisma.submission.create({
    data: { homeworkId, code, passed, output },
  });
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/homework");
  return { ok: true };
}
