"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/homework", label: "Домашки", emoji: "📝" },
  { href: "/notes", label: "Конспекты", emoji: "📚" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-ink-soft hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {link.emoji} {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
