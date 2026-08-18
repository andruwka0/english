"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitProject(
  projectId: string,
  payload: { passed: boolean; code: string; output: string },
): Promise<{ ok: boolean; error?: string }> {
  await requireRole();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { course: { select: { slug: true } } },
  });
  if (!project) return { ok: false, error: "Проект не найден" };

  await prisma.projectSubmission.create({
    data: {
      projectId,
      passed: payload.passed,
      code: payload.code,
      output: payload.output,
    },
  });

  revalidatePath(`/courses/${project.course.slug}/projects`);
  revalidatePath(`/courses/${project.course.slug}/projects/${project.slug}`);
  return { ok: true };
}
