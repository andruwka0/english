import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ProjectRunner } from "@/components/projects/ProjectRunner";
import { prisma } from "@/lib/prisma";
import type { CourseSlug } from "@/generated/prisma/client";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ courseSlug: string; projectSlug: string }>;
}) {
  const { courseSlug, projectSlug } = await params;
  const project = await prisma.project.findFirst({
    where: { slug: projectSlug, course: { slug: courseSlug as CourseSlug } },
    include: { course: true, submissions: { orderBy: { submittedAt: "desc" } } },
  });

  if (!project || project.course.slug !== "python") notFound();
  const passedSubmission = project.submissions.find((submission) => submission.passed);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/courses/${courseSlug}/projects`}
          className="mb-2 inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
        >
          К проектам
        </Link>
        <p className="text-sm font-bold text-ink-soft">{project.course.icon} {project.course.title}</p>
        <h1 className="font-heading text-3xl font-bold text-ink">{project.title}</h1>
        <p className="mt-2 inline-flex rounded-full bg-yellow-soft px-3 py-1 text-sm font-bold text-ink">{project.topic}</p>
      </div>

      <section className="rounded-3xl border-2 border-primary-soft bg-white p-6">
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-ink prose-p:text-ink-soft prose-strong:text-ink">
          <MarkdownRenderer content={project.specification} />
        </div>
      </section>

      <section className="rounded-3xl border-2 border-primary-soft bg-white p-6">
        <h2 className="font-heading text-xl font-bold text-ink">Проверка проекта</h2>
        <p className="mt-1 text-sm text-ink-soft">Перед сдачей код проходит несколько независимых сценариев.</p>
        <div className="mt-5">
          <ProjectRunner
            projectId={project.id}
            starterCode={project.starterCode}
            testCode={project.testCode}
            attemptsUsed={project.submissions.length}
            passedCode={passedSubmission?.code ?? null}
          />
        </div>
      </section>
    </div>
  );
}
