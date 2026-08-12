import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { DeleteNoteButton } from "./DeleteNoteButton";

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, note] = await Promise.all([
    getSession(),
    prisma.note.findUnique({ where: { slug } }),
  ]);

  if (!note) notFound();

  return (
    <article className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-ink">📖 {note.title}</h1>
        {session.role === "teacher" && (
          <div className="flex shrink-0 gap-3 text-sm font-bold">
            <Link
              href={`/notes/${note.slug}/edit`}
              className="rounded-full px-3 py-1.5 text-ink-soft transition hover:bg-primary-soft hover:text-primary"
            >
              Редактировать
            </Link>
            <DeleteNoteButton slug={note.slug} />
          </div>
        )}
      </div>
      <div className="rounded-3xl border-2 border-primary-soft bg-white p-6">
        <MarkdownRenderer content={note.content} />
      </div>
    </article>
  );
}
