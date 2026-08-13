import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "./actions";
import { NavLinks } from "./NavLinks";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const role = await requireRole();
  const passedTasks = await prisma.submission.findMany({
    where: { passed: true },
    distinct: ["taskId"],
    select: { taskId: true },
  });
  const stars = passedTasks.length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <NavLinks />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-teal-soft px-3 py-1.5 font-bold text-teal">
              ⭐ {stars}
            </span>
            <span className="rounded-full bg-yellow-soft px-3 py-1.5 font-bold text-ink">
              {role === "teacher" ? "🧑‍🏫 Учитель" : "🎓 Ученица"}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 font-bold text-ink-soft transition hover:bg-danger-soft hover:text-danger"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
