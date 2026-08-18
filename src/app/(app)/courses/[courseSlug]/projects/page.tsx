import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { prisma } from "@/lib/prisma";
import type { CourseSlug } from "@/generated/prisma/client";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug as CourseSlug },
    include: {
      projects: {
        orderBy: { order: "asc" },
        include: { submissions: { select: { passed: true } } },
      },
    },
  });

  if (!course) notFound();
  if (course.slug !== "python") notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/courses/${course.slug}`}
          className="mb-2 inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
        >
          К курсу
        </Link>
        <h1 className="font-heading text-3xl font-bold text-ink">
          {course.icon} {course.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Отдельные задачи, в которых несколько тем собираются в настоящую программу.</p>
      </div>

      <nav className="flex w-fit rounded-2xl border border-primary-soft bg-white/70 p-1 text-sm font-bold shadow-sm">
        <Link
          href={`/courses/${course.slug}`}
          className="rounded-xl px-4 py-2 text-ink-soft transition hover:bg-primary-soft hover:text-primary"
        >
          Уроки
        </Link>
        <Link href={`/courses/${course.slug}/projects`} className="rounded-xl bg-primary px-4 py-2 text-white shadow-sm">
          Проекты
        </Link>
      </nav>

      {course.projects.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-8 text-center text-ink-soft">
          Первый проект скоро появится здесь.
        </p>
      ) : (
        <div className="space-y-5">
          {course.projects.map((project, index) => {
            const passed = project.submissions.some((submission) => submission.passed);
            return (
            <Link
              key={project.id}
              href={`/courses/${course.slug}/projects/${project.slug}`}
              className="block rounded-3xl border-2 border-primary-soft bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-primary">Проект {index + 1}</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-ink">{project.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {passed && <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">Принят</span>}
                  <span className="rounded-full bg-yellow-soft px-3 py-1 text-sm font-bold text-ink">{project.topic}</span>
                </div>
              </div>
              <div className="prose prose-slate mt-5 max-w-none prose-headings:font-heading prose-headings:text-ink prose-p:text-ink-soft prose-strong:text-ink">
                <MarkdownRenderer content={project.specification} />
              </div>
              <p className="mt-5 text-sm font-bold text-primary">Открыть проект</p>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
