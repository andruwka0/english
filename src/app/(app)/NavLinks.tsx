"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/profile", label: "My Study" },
  { href: "/courses/python", label: "Python" },
  { href: "/courses/english", label: "English" },
  { href: "/vocabulary", label: "Словарь" },
  { href: "/rewards", label: "Награды" },
] as const;
const LESSON_CALL_URL = "https://centraluniversity.ktalk.ru/b3xeo4klg1aw";

export function NavLinks() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return <div className="relative">
    <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="main-navigation" aria-label="Открыть навигацию" title="Меню" className="grid size-9 place-items-center rounded-lg text-xl text-ink transition hover:bg-primary-soft hover:text-primary sm:hidden">☰</button>
    <nav id="main-navigation" className={`${isOpen ? "flex" : "hidden"} glass-surface absolute left-0 top-11 z-30 w-[min(19rem,calc(100vw-2rem))] flex-col gap-1 rounded-xl p-2 sm:static sm:flex sm:w-auto sm:flex-row sm:gap-1 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
      {LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition ${pathname.startsWith(link.href) ? "bg-primary text-white shadow-md shadow-primary/30" : "text-ink-soft hover:bg-primary-soft hover:text-primary"}`}>{link.label}</Link>)}
      <a href={LESSON_CALL_URL} target="_blank" rel="noreferrer" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary">Урок</a>
    </nav>
  </div>;
}
