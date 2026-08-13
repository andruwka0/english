import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function courseProgress(slug: "python" | "english") {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        include: {
          homework: { include: { tasks: { include: { submissions: { select: { passed: true } } } } } },
        },
      },
    },
  });
  if (!course) return null;
  const tasks = course.lessons.flatMap((l) => l.homework?.tasks ?? []);
  const total = tasks.length;
  const passed = tasks.filter((t) => t.submissions.some((s) => s.passed)).length;
  return { icon: course.icon, title: course.title, total, passed };
}

export default async function ProfilePage() {
  const [session, python, english, upcomingDeadlines] = await Promise.all([
    getSession(),
    courseProgress("python"),
    courseProgress("english"),
    prisma.homework.findMany({
      where: { deadline: { gte: new Date() } },
      orderBy: { deadline: "asc" },
      include: {
        lesson: { select: { title: true, slug: true, course: { select: { slug: true, title: true, icon: true } } } },
      },
      take: 10,
    }),
  ]);

  const courses = [python, english].filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold text-ink">
        👤 Профиль {session.role === "student" ? "ученицы" : ""}
      </h1>

      <section className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => {
          const percent = c.total > 0 ? Math.round((c.passed / c.total) * 100) : 0;
          return (
            <div key={c.title} className="space-y-2 rounded-3xl border-2 border-primary-soft bg-white p-5">
              <div className="flex items-center justify-between text-sm font-bold text-ink">
                <span>
                  {c.icon} {c.title}
                </span>
                <span>
                  {c.passed} / {c.total}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-pink to-yellow transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              {c.total > 0 && c.passed === c.total && (
                <p className="text-sm font-bold text-success">🏆 Курс пройден полностью!</p>
              )}
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-ink">📅 Ближайшие дедлайны</h2>
        {upcomingDeadlines.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-primary-soft bg-white/60 p-6 text-center text-sm text-ink-soft">
            Дедлайнов нет. 🌿
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingDeadlines.map((hw) => (
              <li key={hw.id}>
                <Link
                  href={`/courses/${hw.lesson.course.slug}/lessons/${hw.lesson.slug}`}
                  className="flex items-center justify-between rounded-2xl border-2 border-primary-soft bg-white px-4 py-3 text-sm font-bold transition hover:bg-primary-soft"
                >
                  <span>
                    {hw.lesson.course.icon} {hw.lesson.title}
                  </span>
                  <span className="rounded-full bg-teal-soft px-3 py-1 text-teal">
                    до {new Date(hw.deadline!).toLocaleDateString("ru-RU")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
