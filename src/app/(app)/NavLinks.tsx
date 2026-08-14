"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/courses/python", label: "Python", emoji: "🐍" },
  { href: "/courses/english", label: "English", emoji: "🇬🇧" },
  { href: "/vocabulary", label: "Словарик", emoji: "📖" },
  { href: "/profile", label: "Профиль", emoji: "👤" },
] as const;

const LESSON_CALL_URL = "https://centraluniversity.ktalk.ru/b3xeo4klg1aw";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 whitespace-nowrap">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
              active
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-ink-soft hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {link.emoji} {link.label}
          </Link>
        );
      })}
      <a
        href={LESSON_CALL_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-primary-soft hover:text-primary"
      >
        🎥 Урок
      </a>
    </nav>
  );
}
