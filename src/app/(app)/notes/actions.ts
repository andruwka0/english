"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// HTTP headers (used by Next.js to carry the post-action redirect target)
// only allow ASCII, so Cyrillic titles must be transliterated rather than
// kept as-is or stripped (stripping would collapse every Cyrillic title to "note").
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(title: string): string {
  const transliterated = title
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");

  return (
    transliterated
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "note"
  );
}

export async function createNote(_prevState: { error?: string } | undefined, formData: FormData) {
  await requireTeacher();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title || !content.trim()) {
    return { error: "Заполни заголовок и содержимое" };
  }

  let slug = slugify(title);
  const existing = await prisma.note.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const maxOrder = await prisma.note.aggregate({ _max: { order: true } });
  await prisma.note.create({
    data: { title, slug, content, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath("/notes");
  redirect(`/notes/${slug}`);
}

export async function updateNote(
  slug: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  await requireTeacher();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title || !content.trim()) {
    return { error: "Заполни заголовок и содержимое" };
  }

  await prisma.note.update({ where: { slug }, data: { title, content } });

  revalidatePath("/notes");
  revalidatePath(`/notes/${slug}`);
  redirect(`/notes/${slug}`);
}

export async function deleteNote(slug: string) {
  await requireTeacher();
  await prisma.note.delete({ where: { slug } });
  revalidatePath("/notes");
  redirect("/notes");
}
