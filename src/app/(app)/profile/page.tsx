import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function courseProgress(slug: "python" | "english") {
  const course = await prisma.course.findUnique({ where: { slug }, include: { lessons: { orderBy: { order: "asc" }, include: { homework: { include: { tasks: { include: { submissions: { select: { passed: true } } } } } } } } } });
  if (!course) return null;
  const tasks = course.lessons.flatMap((lesson) => lesson.homework?.tasks ?? []);
  const passed = tasks.filter((task) => task.submissions.some((submission) => submission.passed)).length;
  const nextLesson = course.lessons.find((lesson) => (lesson.homework?.tasks ?? []).some((task) => !task.submissions.some((submission) => submission.passed)));
  return { slug: course.slug, icon: course.icon, title: course.title, total: tasks.length, passed, nextLesson };
}

export default async function ProfilePage() {
  const [session, python, english, upcomingDeadlines, spent] = await Promise.all([
    getSession(), courseProgress("python"), courseProgress("english"),
    prisma.homework.findMany({ where: { deadline: { gte: new Date() } }, orderBy: { deadline: "asc" }, include: { lesson: { select: { title: true, slug: true, course: { select: { slug: true, icon: true } } } } }, take: 10 }),
    prisma.rewardPurchase.aggregate({ _sum: { pricePaid: true } }),
  ]);
  const courses = [python, english].filter((course): course is NonNullable<typeof course> => course !== null);
  const availableStars = courses.reduce((total, course) => total + course.passed, 0) - (spent._sum.pricePaid ?? 0);
  return <div className="space-y-8">
    <section className="course-grid glass-surface overflow-hidden rounded-2xl border-blue-100/70 px-5 py-7 sm:px-8"><div className="max-w-2xl space-y-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Личный кабинет</p><h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">My Study</h1><p className="max-w-xl text-base leading-7 text-ink-soft">Твое пространство для Python, английского и маленьких побед каждый день.</p></div></section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => { const percent = course.total > 0 ? Math.round((course.passed / course.total) * 100) : 0; const href = course.nextLesson ? `/courses/${course.slug}/lessons/${course.nextLesson.slug}` : `/courses/${course.slug}`; return <article key={course.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">Направление</p><h2 className="mt-1 font-heading text-xl font-bold text-ink">{course.icon} {course.title}</h2></div><span className="rounded-lg bg-primary-soft px-2.5 py-1 text-sm font-bold text-primary">{percent}%</span></div><div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-teal to-primary" style={{ width: `${percent}%` }} /></div><div className="mt-4 flex items-center justify-between gap-3 text-sm"><span className="font-bold text-ink-soft">{course.passed} из {course.total} заданий</span><Link href={href} className="font-bold text-primary hover:text-primary-dark">{course.nextLesson ? "Продолжить" : "Открыть курс"} →</Link></div></article>; })}<article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm"><div className="relative flex h-full flex-col justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Награды</p><p className="mt-3 text-3xl font-bold">★ {availableStars}</p><p className="mt-1 text-sm text-slate-300">звезд доступно</p></div><div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm"><Link href="/rewards" className="font-semibold text-slate-300 transition hover:text-white">Магазин наград</Link><Link href="/rewards" className="rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white">Открыть</Link></div></div></article></section>
    <section className="space-y-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">План</p><h2 className="mt-1 font-heading text-xl font-bold text-ink">Ближайшие задания {session.role === "teacher" ? "ученицы" : ""}</h2></div>{upcomingDeadlines.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-ink-soft">В расписании пока нет дедлайнов.</p> : <ul className="space-y-2">{upcomingDeadlines.map((homework) => <li key={homework.id}><Link href={`/courses/${homework.lesson.course.slug}/lessons/${homework.lesson.slug}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold transition hover:border-primary hover:bg-primary-soft/30"><span>{homework.lesson.course.icon} {homework.lesson.title}</span><span className="rounded-lg bg-teal-soft px-3 py-1 text-teal">до {new Date(homework.deadline!).toLocaleDateString("ru-RU")}</span></Link></li>)}</ul>}</section>
  </div>;
}
