import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "./actions";
import { NavLinks } from "./NavLinks";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const role = await requireRole();
  const [passedTasks, spent] = await Promise.all([
    prisma.submission.findMany({ where: { passed: true }, distinct: ["taskId"], select: { taskId: true } }),
    prisma.rewardPurchase.aggregate({ _sum: { pricePaid: true } }),
  ]);
  const stars = passedTasks.length - (spent._sum.pricePaid ?? 0);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-surface sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
          <div className="order-1 flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-white shadow-lg shadow-primary/20">M</div>
            <NavLinks />
          </div>
          <div className="order-2 flex items-center gap-1 text-sm sm:gap-3">
            <span className="glass-surface hidden rounded-lg bg-teal-soft/70 px-3 py-1.5 font-bold text-teal sm:inline-flex">
              ⭐ {stars}
            </span>
            <span className="glass-surface hidden rounded-lg bg-white/60 px-3 py-1.5 font-bold text-ink sm:inline-flex">
              {role === "teacher" ? "Учитель" : "Ученица"}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-2 py-1.5 font-bold text-ink-soft transition hover:bg-danger-soft hover:text-danger"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
