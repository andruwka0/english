"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type FormState = { error?: string } | undefined;

export async function createWord(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();

  const term = String(formData.get("term") ?? "").trim();
  const translation = String(formData.get("translation") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();

  if (!term || !translation) {
    return { error: "Заполни слово и перевод" };
  }

  const maxOrder = await prisma.word.aggregate({ _max: { order: true } });
  await prisma.word.create({
    data: { term, translation, example: example || null, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath("/vocabulary");
}

export async function updateWord(
  wordId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireTeacher();

  const term = String(formData.get("term") ?? "").trim();
  const translation = String(formData.get("translation") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();

  if (!term || !translation) {
    return { error: "Заполни слово и перевод" };
  }

  await prisma.word.update({
    where: { id: wordId },
    data: { term, translation, example: example || null },
  });

  revalidatePath("/vocabulary");
}

export async function deleteWord(wordId: string) {
  await requireTeacher();
  await prisma.word.delete({ where: { id: wordId } });
  revalidatePath("/vocabulary");
}
